package helpers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

type pythonResponse struct {
	Valid       bool      `json:"valid"`
	Confidences []float64 `json:"confidences"`
}

func ValidateImagesWithPython(filenames []string) (bool, []float64, error) {
	const uploadPath = "uploads"

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	for _, filename := range filenames {
		filePath := fmt.Sprintf("%s/%s", uploadPath, filename)
		file, err := os.Open(filePath)
		if err != nil {
			return false, []float64{}, fmt.Errorf("error opening file %s: %w", filePath, err)
		}
		defer file.Close()

		part, err := writer.CreateFormFile("files", filePath)
		if err != nil {
			return false, []float64{}, fmt.Errorf("error creating form file for %s: %w", filePath, err)
		}

		if _, err := io.Copy(part, file); err != nil {
			return false, []float64{}, fmt.Errorf("error copying file %s content: %w", filename, err)
		}
	}

	err := writer.Close()
	if err != nil {
		return false, []float64{}, fmt.Errorf("error closing multipart writer: %w", err)
	}

	serviceURL := GetTrashDetectionServiceURL()
	req, err := http.NewRequest("POST", serviceURL+"/validate-images", body)
	if err != nil {
		return false, []float64{}, fmt.Errorf("error creating request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, []float64{}, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return false, []float64{}, fmt.Errorf("service returned status %d: %s", resp.StatusCode, string(body))
	}

	var response pythonResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return false, []float64{}, fmt.Errorf("error decoding response: %w", err)
	}

	fmt.Println("response", response)
	return response.Valid, response.Confidences, nil
}
