package helpers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type pythonRequest struct {
	MarkerId  int64    `json:"markerId"`
	Filenames []string `json:"filenames"`
}

type pythonResponse struct {
	Valid bool `json:"valid"`
}

func ValidateImagesWithPython(markerId int64, filenames []string) (bool, error) {
	requestBody := pythonRequest{
		MarkerId:  markerId,
		Filenames: filenames,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return false, fmt.Errorf("error marshaling request body: %w", err)
	}

	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		resp, err := http.Post(
			"http://localhost:6969/validate-images",
			"application/json",
			bytes.NewBuffer(jsonData),
		)
		if err != nil {
			if i < maxRetries-1 {
				time.Sleep(time.Second * time.Duration(i+1))
				continue
			}
			return false, fmt.Errorf("failed after %d retries: %w", maxRetries, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			if i < maxRetries-1 {
				time.Sleep(time.Second * time.Duration(i+1))
				continue
			}
			return false, fmt.Errorf("service returned status %d: %s", resp.StatusCode, string(body))
		}

		var response pythonResponse
		if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
			return false, fmt.Errorf("error decoding response: %w", err)
		}

		return response.Valid, nil
	}
	return false, fmt.Errorf("failed after %d retries", maxRetries)
}
