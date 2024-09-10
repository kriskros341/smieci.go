package handlers

import (
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

	"backend/api/auth"

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
	Id              int64    `json:"id"`
	Lat             float64  `json:"lat"`
	Long            float64  `json:"long"`
	FileNamesString []string `json:"fileNamesString"`
	BlurHashes      []string `json:"blurHashes"`
	UserId          int64    `json:"userId"`
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
	query := "SELECT id, lat, long, userId FROM markers WHERE id = $1"
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

type CreateMarkerBody struct {
	Lat  float64 `json:"lat"`
	Long float64 `json:"long"`
}

func (e *Env) CreateMarker(c *gin.Context) {
	// Parse the multipart form data
	err := c.Request.ParseMultipartForm(32 << 24) // 512MB max memory
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload too large"})
		return
	}

	var sliceMutex sync.Mutex
	fileNames := []string{}
	blurHashes := []string{}
	fileProcessingErrors := make(chan error, len(c.Request.MultipartForm.File)) // Channel to capture any processing errors
	const maxConcurrent = 3
	semaphore := NewSemaphore(maxConcurrent) // Create a semaphore with capacity

	var waitGroupCounter sync.WaitGroup
	// 1. Handle file uploads
	for key, fileHeaders := range c.Request.MultipartForm.File {
		fmt.Printf("Form key (file): %s\n", key)
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
	}
	// Wait for all goroutines to finish
	waitGroupCounter.Wait()

	// Check for errors during file processing
	close(fileProcessingErrors)
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
		"lat":         payload.Lat,
		"long":        payload.Long,
		"mainPhotoId": fileIds[0],
	}
	query := `
	INSERT INTO Markers (userId, lat, long, mainPhotoId)
		VALUES (
			(SELECT id FROM Users WHERE clerkId = :clerkId),
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

	c.JSON(http.StatusOK, gin.H{"message": "Marker created successfully"})
}
