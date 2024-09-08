package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

const UPLOADS_FOLDER = "./uploads/"

func GenerateContentHashFromFile(fileBytes []byte) (string, error) {
	// Create a new SHA-256 hasher
	hasher := sha256.New()

	// Write the file bytes to the hasher
	_, err := hasher.Write(fileBytes)
	if err != nil {
		return "", err
	}
	// Generate the hash in hexadecimal format
	return hex.EncodeToString(hasher.Sum(nil)), nil
}

// TransformFileNameFromFileData takes the file data from Gin context, hashes the content, and appends the current timestamp.
func TransformFileNameFromFileData(fileBytes []byte, originalFileName string) (string, error) {
	// Get the current timestamp in the desired format
	timestamp := time.Now().Format("20060102150405") // YYYYMMDDHHMMSS

	// Get the hash of the file content
	hash, err := GenerateContentHashFromFile(fileBytes)
	if err != nil {
		return "", err
	}

	// Extract the file extension (optional, based on the original file name)
	ext := ""
	if len(originalFileName) > 0 {
		for i := len(originalFileName) - 1; i >= 0; i-- {
			if originalFileName[i] == '.' {
				ext = originalFileName[i:]
				break
			}
		}
	}

	// Combine timestamp and hash (and optionally the extension)
	newFileName := fmt.Sprintf("%s_%s%s", timestamp, hash, ext)

	return newFileName, nil
}

type GetFilePayload struct {
	UploadId int64 `uri:"uploadId" binding:"required"`
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

	// query db for upload with said id
	query := "SELECT filename FROM uploads WHERE id = $1"
	fmt.Println("Executing query:", query, "with uploadId:", uploadId)
	var fileName string
	if err := e.Db.Get(&fileName, query, uploadId); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File id not found in db"})
		return
	}
	// create path and read file
	filePath := fmt.Sprintf(`%s%s`, UPLOADS_FOLDER, fileName)
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found in fs"})
		return
	}

	c.Header("Content-Type", "image/jpeg")
	// Serve the file
	c.File(filePath)
}
