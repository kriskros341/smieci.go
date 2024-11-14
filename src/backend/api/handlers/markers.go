package handlers

import (
	"backend/api/auth"
	"bytes"
	"image"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"encoding/json"
	"fmt"

	"github.com/buckket/go-blurhash"
	"github.com/gin-gonic/gin"

	_ "image/jpeg"
)

type MarkerCoordinates struct {
	Id          int64   `json:"id"`
	Lat         float64 `json:"lat"`
	Long        float64 `json:"long"`
	MainPhotoId int64   `json:"mainPhotoId"`
	Blurhash    string  `json:"blurhash"`
}

func (e *Env) GetMarkersCoordinates(c *gin.Context) {
	var markers []MarkerCoordinates

	err := e.Db.Select(&markers, "SELECT m.id, m.lat, m.long, m.mainPhotoId, u.blurhash FROM markers m JOIN uploads u ON u.id = m.mainPhotoId")
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	c.JSON(http.StatusOK, markers)
}

type Upload struct {
	Id       int64  `json:"id"`
	Filename string `json:"filename"`
	BlurHash string `json:"blurHash"`
}

type GetMarkerPayload struct {
	Id                        int64    `json:"id"`
	Lat                       float64  `json:"lat"`
	Long                      float64  `json:"long"`
	FileNamesString           []string `json:"fileNamesString"`
	BlurHashes                []string `json:"blurHashes"`
	UserId                    string   `json:"userId"`
	Points                    int64    `json:"points"`
	PendingVerificationsCount int64    `json:"pendingVerificationsCount"` // -1 if approved else ++
	LatestSolutionId          int64    `json:"latestSolutionId"`
}

type VerificationStatus struct {
	VerificationStatus string `db:"verification_status"`
	Id                 int64  `db:"id"`
}

type GetMarkerRequestPayload struct {
	MarkerId string `uri:"markerId" binding:"required"`
}

func (e *Env) GetMarker(c *gin.Context) {
	var markerRequestPayload GetMarkerRequestPayload
	var marker GetMarkerPayload

	// Recieve marker id payload
	if err := c.ShouldBindUri(&markerRequestPayload); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}
	markerId := markerRequestPayload.MarkerId

	// Query db for said marker
	query := "SELECT id, lat, long, userId, points FROM markers WHERE id = $1"
	fmt.Println("Executing query:", query, "with markerId:", markerId)

	err := e.Db.Get(&marker, query, markerId)
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	// Query db for associated uploads
	query = "SELECT up.id, up.blurhash from uploads up JOIN relation_marker_uploads rmu on up.id = rmu.uploadId WHERE rmu.markerId = $1"
	fmt.Println("Executing query:", query, "with markerId:", markerId)
	uploadRow, err := e.Db.Query(query, markerId)
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	var latestSolutionId int64
	var pendingVerificationsCount int64
	{

		var result []VerificationStatus
		query = fmt.Sprintf("SELECT id, verification_status FROM solutions WHERE markerid = %s", markerId)
		err := e.Db.Select(&result, query)
		if err != nil {
			var error = gin.H{"error": err.Error()}
			fmt.Println(error)
			c.JSON(http.StatusInternalServerError, error)
			return
		}

		for _, currentSolution := range result {
			fmt.Println(currentSolution)
			if currentSolution.VerificationStatus == "approved" {
				latestSolutionId = currentSolution.Id
				pendingVerificationsCount = -1
				break
			} else if currentSolution.VerificationStatus == "pending" {
				latestSolutionId = currentSolution.Id
				pendingVerificationsCount += 1
			}
		}
	}
	filesIds := []string{}
	blurHashes := []string{}

	// Parse uploads to array
	for uploadRow.Next() {
		var id string
		var blurHash string
		uploadRow.Scan(&id, &blurHash)
		filesIds = append(filesIds, id)
		blurHashes = append(blurHashes, blurHash)
	}

	defer uploadRow.Close()

	marker.LatestSolutionId = latestSolutionId
	marker.PendingVerificationsCount = pendingVerificationsCount
	marker.FileNamesString = filesIds
	marker.BlurHashes = blurHashes
	c.JSON(http.StatusOK, marker)
}

// Semaphore is a simple semaphore implementation
type Semaphore struct {
	ch chan struct{}
}

// NewSemaphore creates a new Semaphore
func NewSemaphore(max int) *Semaphore {
	return &Semaphore{ch: make(chan struct{}, max)}
}

// Acquire decreases the semaphore count, blocking if necessary
func (s *Semaphore) Acquire() {
	s.ch <- struct{}{} // This will block if the channel is full
}

// Release increases the semaphore count
func (s *Semaphore) Release() {
	<-s.ch // This releases one slot in the channel
}

func processFiles(fileHeaders []*multipart.FileHeader) ([]string, []string, chan error) {
	var sliceMutex sync.Mutex
	fileNames := []string{}
	blurHashes := []string{}
	fileProcessingErrors := make(chan error, len(fileHeaders)) // Channel to capture any processing errors
	const maxConcurrent = 3
	semaphore := NewSemaphore(maxConcurrent) // Create a semaphore with capacity

	var waitGroupCounter sync.WaitGroup
	for _, fileHeader := range fileHeaders {
		waitGroupCounter.Add(1)
		// Launch a goroutine to handle file upload concurrently
		go func(fileHeader *multipart.FileHeader) {
			defer waitGroupCounter.Done() // Mark this goroutine as done
			semaphore.Acquire()           // Acquire the semaphore
			defer semaphore.Release()     // Ensure the semaphore is released

			// Open the file
			file, err := fileHeader.Open()
			if err != nil {
				fileProcessingErrors <- fmt.Errorf("error opening file: %w", err)
				return
			}
			defer file.Close()

			// Create a buffer to hold file chunks
			fileBuffer := new(bytes.Buffer)
			_, err = io.Copy(fileBuffer, file) // Copying whole file in memory...
			if err != nil {
				fileProcessingErrors <- fmt.Errorf("error reading file: %w", err)
				return
			}
			fileBytes := fileBuffer.Bytes()

			// Generate new file name
			newFileName, err := TransformFileNameFromFileData(fileBytes, fileHeader.Filename)
			if err != nil {
				fileProcessingErrors <- fmt.Errorf("error generating file name: %w", err)
				return
			}

			// Save file to disk in chunks
			savePath := filepath.Join(UPLOADS_FOLDER, newFileName)
			outFile, err := os.Create(savePath)
			if err != nil {
				fileProcessingErrors <- fmt.Errorf("failed to save file: %w", err)
				return
			}
			defer outFile.Close()

			_, err = outFile.Write(fileBytes) // Write the file data to disk
			if err != nil {
				fileProcessingErrors <- fmt.Errorf("error writing file: %w", err)
				return
			}

			// Recreate image from bytes
			img, _, err := image.Decode(bytes.NewReader(fileBytes))
			if err != nil {
				fileProcessingErrors <- fmt.Errorf("failed to generate placeholder image: %w", err)
				return
			}

			// Create blur hash
			blurHash, err := blurhash.Encode(4, 4, img)
			if err != nil {
				fileProcessingErrors <- fmt.Errorf("failed to generate blur hash: %w", err)
				return
			}

			// Safely update shared slices
			sliceMutex.Lock()
			blurHashes = append(blurHashes, blurHash)
			fileNames = append(fileNames, newFileName)
			sliceMutex.Unlock()
		}(fileHeader)
	}
	// Wait for all goroutines to finish
	waitGroupCounter.Wait()

	// Check for errors during file processing
	close(fileProcessingErrors)

	return fileNames, blurHashes, fileProcessingErrors
}

type CreateMarkerBody struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func (e *Env) CreateMarker(c *gin.Context) {
	// Parse the multipart form data
	err := c.Request.ParseMultipartForm(32 << 24) // 512MB max memory
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload too large"})
		return
	}

	var allFileHeaders []*multipart.FileHeader
	for _, fileHeaders := range c.Request.MultipartForm.File {
		for _, fileHeader := range fileHeaders {
			allFileHeaders = append(allFileHeaders, fileHeader)
		}
	}
	fileNames, blurHashes, fileProcessingErrors := processFiles(allFileHeaders)

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

	// 3. Parse JSON data into the CreateMarkerBody struct
	var payload CreateMarkerBody
	if err := json.Unmarshal([]byte(jsonData), &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
		return
	}

	// Authorize user
	claims, exists := c.Get("authorizerClaims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var clerkId = claims.(*auth.AuthorizerClaims).UserId

	// KCTODO TRANSAKCJA?!?!
	// Insert upload records into database
	rows := []string{}
	for i := 0; i < len(fileNames); i++ {
		rows = append(rows, fmt.Sprintf(`('%s', '%s')`, fileNames[i], blurHashes[i]))
	}
	filesQuery := fmt.Sprintf(`INSERT INTO uploads (filename, blurHash) VALUES %s RETURNING id`, strings.Join(rows, ","))

	fmt.Println("Executing query:", filesQuery)
	fileIdentifiersResult, err := e.Db.Query(filesQuery)
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	// Store the inserted IDs
	var fileIds []string
	for fileIdentifiersResult.Next() {
		var id int
		err := fileIdentifiersResult.Scan(&id)
		if err != nil {
			log.Fatal(err)
		}
		fileIds = append(fileIds, fmt.Sprintf("%d", id))
	}
	defer fileIdentifiersResult.Close()

	// Insert new marker into the database
	data := map[string]interface{}{
		"clerkId":     clerkId,
		"lat":         payload.Latitude,
		"long":        payload.Longitude,
		"mainPhotoId": fileIds[0],
	}
	query := `
	INSERT INTO Markers (userId, lat, long, mainPhotoId)
		VALUES (
			:clerkId,
			:lat,
			:long,
			:mainPhotoId
		) RETURNING id;
	`
	fmt.Println("Executing query:", query, "with data:", data)
	fmt.Println(clerkId)
	markerIdResult, err := e.Db.NamedQuery(query, data)

	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	// Create relation between current marker and uploads
	var currentMarkerId int
	if markerIdResult.Next() {
		err := markerIdResult.Scan(&currentMarkerId)
		if err != nil {
			log.Fatal(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create relation marker->uploads"})
			return
		}
		if err != nil {
		}
	}
	defer markerIdResult.Close()

	rows = []string{}
	for i := 0; i < len(fileIds); i++ {
		rows = append(rows, fmt.Sprintf(`(%d, %s)`, currentMarkerId, fileIds[i]))
	}

	insertedMarkerUploadsRelations := strings.Join(rows, ",")

	query = fmt.Sprintf(`INSERT INTO relation_marker_uploads (markerId, uploadId) VALUES %s`, insertedMarkerUploadsRelations)

	fmt.Println("Executing query:", query)

	_, err = e.Db.Exec(query)
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	// time.Sleep(time.Second * 64)
	c.JSON(http.StatusOK, gin.H{"message": "Marker created successfully"})
}

type SupportMarkerBody struct {
	UserId   string `json:"userId"`
	MarkerId int32  `json:"markerId"`
	Amount   int64  `json:"amount"`
}

func (e *Env) SupportMarker(c *gin.Context) {
	var body SupportMarkerBody

	if err := c.BindJSON(&body); err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}

	usersQuery := fmt.Sprintf(`UPDATE users SET points = points - %d where id = '%s'`, body.Amount, body.UserId)
	markersQuery := fmt.Sprintf(`UPDATE markers SET points = points + %d WHERE id = %d`, body.Amount, body.MarkerId)
	tracesQuery := fmt.Sprintf(`INSERT INTO points_traces (userId, markerId, amount) VALUES ('%s', %d, %d)`, body.UserId, body.MarkerId, body.Amount)

	tx, err := e.Db.Begin()
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to begin transaction"})
		return
	}
	fmt.Println("Executing in transaction query:", usersQuery)
	_, err = tx.Exec(usersQuery)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "transaction query failed"})
		return
	}
	fmt.Println("Executing in transaction query:", markersQuery)
	_, err = tx.Exec(markersQuery)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "transaction query failed"})
		return
	}
	fmt.Println("Executing in transaction query:", tracesQuery)
	_, err = tx.Exec(tracesQuery)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "transaction query failed"})
		return
	}
	err = tx.Commit()
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "transaction failed"})
		return
	}
	c.JSON(http.StatusOK, "")
}

type GetMarkerSupportersResult struct {
	Id              string  `json:"id"`
	Username        string  `json:"username"`
	Total           int32   `json:"total"`
	ProfileImageUrl *string `json:"profileImageUrl"`
}

func (e *Env) GetMarkerSupporters(c *gin.Context) {
	var getMarkerRequestPayload GetMarkerRequestPayload
	results := []GetMarkerSupportersResult{}

	// Recieve marker id payload
	if err := c.ShouldBindUri(&getMarkerRequestPayload); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}

	query := fmt.Sprintf(`select u.id as id, u.username, SUM(pt.amount) as total, u.profileImageUrl from points_traces pt join users u on pt.userId = u.id where pt.markerId = %s group by u.id`, getMarkerRequestPayload.MarkerId)
	fmt.Printf("Executing query: %s\n", query)
	if err := e.Db.Select(&results, query); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusOK, results)
}
