package handlers

import (
	"backend/helpers"
	"backend/models"
	"mime/multipart"
	"net/http"

	"encoding/json"
	"fmt"

	"github.com/gin-gonic/gin"

	_ "image/jpeg"
)

func (e *Env) GetMarkersCoordinates(c *gin.Context) {
	MarkerCoordinates, err := e.Markers.GetMarkersCoordinates()
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	c.JSON(http.StatusOK, MarkerCoordinates)
}

type GetMarkerRequestPayload struct {
	MarkerId string `uri:"markerId" binding:"required"`
}

func (e *Env) GetMarkerById(c *gin.Context) {
	var markerRequestPayload GetMarkerRequestPayload
	if err := c.ShouldBindUri(&markerRequestPayload); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}

	marker, err := e.Markers.GetMarkerById(markerRequestPayload.MarkerId)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	solutionPayload, err := e.Solutions.GetSolutionsInfoForMarker(markerRequestPayload.MarkerId)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	marker.LatestSolutionId = solutionPayload.LatestSolutionId
	marker.PendingVerificationsCount = solutionPayload.PendingVerificationsCount
	c.JSON(http.StatusOK, marker)
}

func (e *Env) CreateMarker(c *gin.Context) {
	// Parse the multipart form data
	err := c.Request.ParseMultipartForm(32 << 24) // 512MB max memory
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload too large"})
		return
	}

	var allFilesHeaders []*multipart.FileHeader
	for _, fileHeaders := range c.Request.MultipartForm.File {
		for _, fileHeader := range fileHeaders {
			allFilesHeaders = append(allFilesHeaders, fileHeader)
		}
	}

	filesIds, err := e.Uploads.CreateUploadsFromHeaders(allFilesHeaders)

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

	// 3. Parse JSON data into the CreateMarkerBody struct
	var payload models.CreateMarkerBody
	if err := json.Unmarshal([]byte(jsonData), &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
		return
	}

	userId, err := helpers.GetUserIdFromSession(c)
	if err != nil {
		println(err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing JSON data"})
		return
	}
	err = e.Markers.CreateMarker(payload, userId, filesIds)
	if err != nil {
		println(err.Error())
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	// time.Sleep(time.Second * 64)
	c.JSON(http.StatusOK, gin.H{"message": "Marker created successfully"})
}

type SupportMarkerBody struct {
	UserId   string `json:"userId"`
	MarkerId int64  `json:"markerId"`
	Amount   int64  `json:"amount"`
}

func (e *Env) SupportMarker(c *gin.Context) {
	var body SupportMarkerBody

	if err := c.BindJSON(&body); err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}

	err := e.Markers.SupportMarker(body.UserId, body.MarkerId, body.Amount)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(http.StatusOK, "")
}

func (e *Env) GetMarkerSupporters(c *gin.Context) {
	var getMarkerRequestPayload GetMarkerRequestPayload
	// Recieve marker id payload
	if err := c.ShouldBindUri(&getMarkerRequestPayload); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}
	results, err := e.Markers.GetMarkerSupporters(getMarkerRequestPayload.MarkerId)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusOK, results)
}

func (e *Env) PatchMarkersPhotos(c *gin.Context) {
	var getMarkerRequestPayload GetMarkerRequestPayload
	// Recieve marker id payload
	if err := c.ShouldBindUri(&getMarkerRequestPayload); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, err)
		return
	}

	var allFilesHeaders []*multipart.FileHeader
	for _, fileHeaders := range c.Request.MultipartForm.File {
		for _, fileHeader := range fileHeaders {
			allFilesHeaders = append(allFilesHeaders, fileHeader)
		}
	}

	filesIds, err := e.Uploads.CreateUploadsFromHeaders(allFilesHeaders)

	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}

}
