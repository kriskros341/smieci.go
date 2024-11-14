package handlers

import (
	"backend/api/auth"
	"encoding/json"
	"fmt"
	"log"
	"mime/multipart"
	"net/http"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
)

// Define a struct for photos with an optional URI field
type Photo struct {
	Uri *string `json:"uri"` // Pointer allows for null (optional) value
}

// Define a struct for participants
type Participant struct {
	UserId string `db:"id" json:"userId"`
}

// Main struct that holds the payload
type PostMarkerSolutionPayload struct {
	Participants []Participant `json:"participants"` // Array of participants
}

// Main struct that holds the payload
type PostMarkerSolutionUriPayload struct {
	MarkerId string `json:"markerId"` // Marker id
}

func (e *Env) PostMarkerSolution(c *gin.Context) {
	var getMarkerRequestPayload GetMarkerRequestPayload
	if err := c.ShouldBindUri(&getMarkerRequestPayload); err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusBadRequest, error)
		return
	}

	// Parse the multipart form data
	err := c.Request.ParseMultipartForm(32 << 24) // 512MB max memory
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload too large"})
		return
	}

	// Authorize user
	claims, exists := c.Get("authorizerClaims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	// KCTODO
	var _ = claims.(*auth.AuthorizerClaims).UserId

	var primaryFiles []*multipart.FileHeader
	var additionalFiles []*multipart.FileHeader

	for key, fileHeaders := range c.Request.MultipartForm.File {
		if key != "primary" && key != "additional" {
			continue
		}

		for _, fileHeader := range fileHeaders {
			if key == "primary" {
				primaryFiles = append(primaryFiles, fileHeader)
			} else if key == "additional" {
				additionalFiles = append(additionalFiles, fileHeader)
			}
		}
	}

	primaryFileNames, primaryBlurHashes, fileProcessingErrors := processFiles(primaryFiles)

	for err := range fileProcessingErrors {
		if err != nil {
			fmt.Println("File processing error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	additionalFileNames, additionalBlurHashes, fileProcessingErrors := processFiles(additionalFiles)

	for err := range fileProcessingErrors {
		if err != nil {
			fmt.Println("File processing error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// 2. Extract JSON data (as string) from the form
	jsonData := c.PostForm("payload")
	if jsonData == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing JSON data"})
		return
	}

	// 3. Parse JSON data into the PostMarkerSolutionPayload struct
	var payload PostMarkerSolutionPayload
	if err := json.Unmarshal([]byte(jsonData), &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
		return
	}

	tx, err := e.Db.Begin()

	var primaryFileIds []string
	// STEP: Insert primary upload records into database
	{
		rows := []string{}
		for i := 0; i < len(primaryFileNames); i++ {
			rows = append(rows, fmt.Sprintf(`('%s', '%s')`, primaryFileNames[i], primaryBlurHashes[i]))
		}
		filesQuery := fmt.Sprintf(`INSERT INTO uploads (filename, blurHash) VALUES %s RETURNING id`, strings.Join(rows, ","))
		fmt.Println("Executing query:", filesQuery)
		fileIdentifiersResult, err := tx.Query(filesQuery)
		if err != nil {
			var error = gin.H{"error": err.Error()}
			fmt.Println(error)
			c.JSON(http.StatusInternalServerError, error)
			tx.Rollback()
			return
		}

		for fileIdentifiersResult.Next() {
			var id int
			err := fileIdentifiersResult.Scan(&id)
			if err != nil {
				tx.Rollback()
				log.Fatal(err)
				return
			}
			primaryFileIds = append(primaryFileIds, fmt.Sprintf("%d", id))
		}
		defer fileIdentifiersResult.Close()
	}
	// STEP: Insert additional upload records into database
	var additionalFileIds []string
	{
		rows := []string{}
		for i := 0; i < len(additionalFileNames); i++ {
			rows = append(rows, fmt.Sprintf(`('%s', '%s')`, additionalFileNames[i], additionalBlurHashes[i]))
		}
		filesQuery := fmt.Sprintf(`INSERT INTO uploads (filename, blurHash) VALUES %s RETURNING id`, strings.Join(rows, ","))
		if len(rows) != 0 {
			fmt.Println("Executing query:", filesQuery)
			fileIdentifiersResult, err := tx.Query(filesQuery)
			if err != nil {
				var error = gin.H{"error": err.Error()}
				fmt.Println(error)
				c.JSON(http.StatusInternalServerError, error)
				tx.Rollback()
				return
			}

			for fileIdentifiersResult.Next() {
				var id int
				err := fileIdentifiersResult.Scan(&id)
				if err != nil {
					tx.Rollback()
					log.Fatal(err)
					return
				}
				additionalFileIds = append(additionalFileIds, fmt.Sprintf("%d", id))
			}
			defer fileIdentifiersResult.Close()
		}
	}
	// STEP: Create solution
	var solutionId int
	insertSolutionQuery := fmt.Sprintf(`INSERT INTO solutions (markerid) VALUES (%s) RETURNING id`, getMarkerRequestPayload.MarkerId)
	fmt.Println("Executing query: %s", insertSolutionQuery)
	err = tx.QueryRow(insertSolutionQuery).Scan(&solutionId)
	if err != nil {
		tx.Rollback()
		log.Fatalln("Error executing query:", err.Error())
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	// STEP: POPULATE SOLUTIONS-USERS RELATION
	{
		values := []string{}
		for _, participant := range payload.Participants {
			values = append(values, fmt.Sprintf(`(%d, '%s')`, solutionId, participant.UserId))
		}
		insertSolutionUsersQuery := fmt.Sprintf(`INSERT INTO solutions_users_relation (solutionid, userId) VALUES %s`, strings.Join(values, ","))
		fmt.Println("Executing query:", insertSolutionUsersQuery)
		_, err := tx.Exec(insertSolutionUsersQuery)

		if err != nil {
			var error = gin.H{"error": err.Error()}
			fmt.Println(error)
			c.JSON(http.StatusInternalServerError, error)
			tx.Rollback()
			return
		}
	}

	// STEP: POPULATE SOLUTION-UPLOADS RELATION
	{
		values := []string{}
		for _, uploadId := range primaryFileIds {
			values = append(values, fmt.Sprintf(`('%d', '%s', 'primary')`, solutionId, uploadId))
		}
		for _, uploadId := range additionalFileIds {
			values = append(values, fmt.Sprintf(`('%d', '%s', 'additional')`, solutionId, uploadId))
		}
		insertSolutionUsersQuery := fmt.Sprintf(`INSERT INTO solutions_uploads_relation (solutionid, uploadid, uploadtype) VALUES %s`, strings.Join(values, ","))
		fmt.Println("Executing query:", insertSolutionUsersQuery)
		_, err := tx.Exec(insertSolutionUsersQuery)

		if err != nil {
			var error = gin.H{"error": err.Error()}
			fmt.Println(error)
			c.JSON(http.StatusInternalServerError, error)
			tx.Rollback()
			return
		}
	}

	tx.Commit()
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		tx.Rollback()
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Solution created successfully"})
}

// KCTODO move to solutions.go
type GetSolutionRequestPayload struct {
	SolutionId string `uri:"solutionId" binding:"required"`
}

type SolutionUpload struct {
	Upload
	UploadType string `db:"uploadtype"`
}

type GetSolutionResponsePayload struct {
	Participants     []Participant    `json:"participants"`
	Photos           []SolutionUpload `json:"photos"`
	AdditionalPhotos []SolutionUpload `json:"additionalPhotos"`
}

func (e *Env) GetSolution(c *gin.Context) {

	var solutionRequestPayload GetSolutionRequestPayload

	if err := c.ShouldBindUri(&solutionRequestPayload); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}
	solutionId := solutionRequestPayload.SolutionId

	{
		query := fmt.Sprintf(`select id from solutions where id = $1`)
		fmt.Printf("executing query: %s, with parameter %s", query, solutionId)
		rows, err := e.Db.Query(query, solutionId)
		if err != nil {
			log.Fatalln("Error executing query:", err.Error())
			c.JSON(http.StatusInternalServerError, err)
			return
		}
		defer rows.Close()

		if !rows.Next() {
			log.Println("No solution found with the provided ID.")
			c.JSON(http.StatusNotFound, gin.H{"error": "Solution not found"})
			return
		}
	}

	var participants []Participant
	// get associated users
	{
		query := fmt.Sprintf(`
select users.id FROM solutions_users_relation susr
	join users on susr.userid = users.id
WHERE susr.solutionid = %s;
			`, solutionId)
		fmt.Printf("executing query: %s", query)
		err := e.Db.Select(&participants, query)
		if err != nil {
			log.Fatalln("Error executing query:", err.Error())
			c.JSON(http.StatusInternalServerError, err)
			return
		}
	}
	var uplodads []SolutionUpload
	// get associated uploads
	{
		query := fmt.Sprintf(`
select uploads.id, filename, blurhash, uploadtype FROM solutions_uploads_relation supr
	join uploads on supr.uploadid = uploads.id
WHERE supr.solutionid = %s;
			`, solutionId)
		fmt.Printf("executing query: %s", query)
		err := e.Db.Select(&uplodads, query)
		if err != nil {
			log.Fatalln("Error executing query:", err.Error())
			c.JSON(http.StatusInternalServerError, err)
			return
		}
	}

	var additionalPhotos []SolutionUpload
	var primaryPhotos []SolutionUpload
	for _, upload := range uplodads {
		if upload.UploadType == "additional" {
			additionalPhotos = append(additionalPhotos, upload)
		} else {
			primaryPhotos = append(primaryPhotos, upload)
		}
	}
	result := GetSolutionResponsePayload{
		Participants:     participants,
		Photos:           primaryPhotos,
		AdditionalPhotos: additionalPhotos,
	}
	c.JSON(http.StatusOK, result)
}

type SetSolutionStatusPayload struct {
	Status string `json:"status"`
}

func (e *Env) SetSolutionStatus(c *gin.Context) {

	claims, exists := c.Get("authorizerClaims")

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "No claim"})
		return
	}
	userId := claims.(*auth.AuthorizerClaims).UserId
	var permissions []string
	query := fmt.Sprintf("SELECT p.pname FROM permissions p JOIN users_permissions_relation upr on p.id = upr.permissionId where upr.userId = '%s'", userId)
	fmt.Println("Executing query:", query)
	err := e.Db.Select(&permissions, query)
	if err != nil {
		var e = gin.H{"error": err.Error()}
		fmt.Println(e)
		c.JSON(http.StatusInternalServerError, e)
		return
	}

	if !slices.Contains(permissions, "reviewing") {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No permissions"})
		return
	}

	var solutionRequestPayload GetSolutionRequestPayload

	if err := c.ShouldBindUri(&solutionRequestPayload); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}

	solutionId := solutionRequestPayload.SolutionId
	var setSolutionStatusPayload SetSolutionStatusPayload
	println("teset")

	if err := c.BindJSON(&setSolutionStatusPayload); err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}

	Status := setSolutionStatusPayload.Status
	query = fmt.Sprintf("UPDATE solutions set verification_status = '%s' WHERE id = %s", Status, solutionId)
	_, err = e.Db.Exec(query)
	if err != nil {
		var e = gin.H{"error": err.Error()}
		fmt.Println(e)
		c.JSON(http.StatusInternalServerError, e)
		return
	}

	c.JSON(http.StatusOK, "success")
}
