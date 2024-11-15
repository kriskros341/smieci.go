package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type GetFilePayload struct {
	UploadId string `uri:"uploadId" binding:"required"`
}

func (e *Env) GetFile(c *gin.Context) {
	// recieve upload id
	var getFilePayload GetFilePayload
	if err := c.ShouldBindUri(&getFilePayload); err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, error)
		return
	}

	uploadId := getFilePayload.UploadId
	filePath, err := e.Uploads.GetPathForUploadById(uploadId)
	if err != nil {
		println(err.Error())
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found in fs"})
		return
	}

	c.Header("Content-Type", "image/jpeg")
	// Serve the file
	c.File(filePath)
}
