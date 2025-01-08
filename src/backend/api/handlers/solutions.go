package handlers

import (
	"backend/api/auth"
	"backend/database"
	"backend/helpers"
	"backend/models"
	"encoding/json"
	"fmt"
	"log"
	"mime/multipart"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Define a struct for photos with an optional URI field
type Photo struct {
	Uri *string `json:"uri"` // Pointer allows for null (optional) value
}

// Main struct that holds the payload
type PostMarkerSolutionUriPayload struct {
	MarkerId string `json:"markerId"` // Marker id
}

// Main struct that holds the payload
type PostMarkerSolutionPayload struct {
	Participants []models.Participant `json:"participants"` // Array of participants
}

func (e *Env) PostMarkerSolution(c *gin.Context) {
	// Get markerId from uri
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

	// Save files
	primaryFilesIds, err := e.Uploads.CreateUploadsFromHeaders(primaryFiles)
	if err != nil {
		fmt.Println("File processing error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	additionalFilesIds, err := e.Uploads.CreateUploadsFromHeaders(additionalFiles)
	if err != nil {
		fmt.Println("File processing error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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

	var participantsIds []string
	for _, participant := range payload.Participants {
		participantsIds = append(participantsIds, participant.UserId)
	}

	isValid, err := e.Solutions.CreateSolution(getMarkerRequestPayload.MarkerId, participantsIds, primaryFilesIds, additionalFilesIds)
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	if isValid {
		c.JSON(http.StatusOK, gin.H{"isValid": true, "message": "Solution created successfully"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"isValid": false, "message": "Solution has been denied by automatic system"})

}

type GetSolutionRequestPayload struct {
	SolutionId int `uri:"solutionId" binding:"required"`
}

type GetSolutionResponseDto struct {
	Participants     []models.Participant    `json:"participants"`
	Photos           []models.SolutionUpload `json:"photos"`
	AdditionalPhotos []models.SolutionUpload `json:"additionalPhotos"`
}

func (e *Env) GetSolution(c *gin.Context) {

	var solutionRequestPayload GetSolutionRequestPayload

	if err := c.ShouldBindUri(&solutionRequestPayload); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}
	solutionId := solutionRequestPayload.SolutionId
	exists, err := e.Solutions.DoesExistById(solutionId)

	if err != nil {
		log.Fatalln("Error executing query:", err.Error())
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	if !exists {
		c.JSON(http.StatusNotFound, err)
		return
	}

	participants, err := e.Users.GetParticipantsBySolutionId(solutionId)
	if err != nil {
		log.Fatalln("Error executing query:", err.Error())
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	uploads, err := e.Uploads.GetUploadsBySolutionId(solutionId)
	if err != nil {
		log.Fatalln("Error executing query:", err.Error())
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	var additionalPhotos []models.SolutionUpload
	var primaryPhotos []models.SolutionUpload
	for _, upload := range uploads {
		if upload.UploadType == "additional" {
			additionalPhotos = append(additionalPhotos, upload)
		} else {
			primaryPhotos = append(primaryPhotos, upload)
		}
	}
	result := GetSolutionResponseDto{
		Participants:     participants,
		Photos:           primaryPhotos,
		AdditionalPhotos: additionalPhotos,
	}
	c.JSON(http.StatusOK, result)
}

type SetSolutionStatusPayload struct {
	Status database.SolutionStatus `json:"status"`
}

func (e *Env) SetSolutionStatus(c *gin.Context) {
	claims, exists := c.Get("authorizerClaims")
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "No claim"})
		return
	}

	if err := helpers.Authorize(e.Db, claims.(*auth.AuthorizerClaims), database.PermissionReviewing); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusUnauthorized, err.Error())
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

	if err := c.BindJSON(&setSolutionStatusPayload); err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}

	var err error = nil
	// Act on solution
	status := setSolutionStatusPayload.Status
	solutionStatus, err := e.Solutions.GetSolutionStatus(solutionId)
	if err != nil {
		var e = gin.H{"error": err.Error()}
		fmt.Println(e)
		c.JSON(http.StatusInternalServerError, e)
		return
	}

	switch {
	case status == database.SolutionStatusApproved && solutionStatus == database.SolutionStatusPending:
		{
			err = e.Solutions.ApproveMarkerSolution(solutionId)
		}
	case status == database.SolutionStatusDenied && solutionStatus == database.SolutionStatusPending:
		{
			err = e.Solutions.DenyMarkerSolution(solutionId)
		}
	case status == database.SolutionStatusPending && solutionStatus != database.SolutionStatusPending:
		{
			err = e.Solutions.ReopenMarkerSolution(solutionId)
		}
	default:
		{
			err = fmt.Errorf("invalid operation %s -> %s", solutionStatus, status)
		}
	}

	if err != nil {
		var e = gin.H{"error": err.Error()}
		fmt.Println(e)
		c.JSON(http.StatusInternalServerError, e)
		return
	}

	c.JSON(http.StatusOK, "success")
}
