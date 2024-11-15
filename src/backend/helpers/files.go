package helpers

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"image"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/buckket/go-blurhash"
)

const UPLOADS_FOLDER = "./uploads/"

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

func ProcessFiles(fileHeaders []*multipart.FileHeader) ([]string, []string, chan error) {
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
