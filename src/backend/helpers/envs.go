package helpers

import (
	"os"

	"github.com/joho/godotenv"
)

// Load .env envs if not loaded already. This is only for local development outside Docker.
// Else do nothing.
func LoadEnvsIfNotLoaded() error {
	if os.Getenv("HOST") == "" {
		err := godotenv.Load()
		return err
	}
	return nil
}

func GetTrashDetectionServiceURL() string {
	env := os.Getenv("HOST")
	if env == "postgres" { // postgres - in docker, localhost - locally. Yeah the naming is stupid but no time for refactor
		return "http://trash-detection:6969"
	}
	return "http://localhost:6969"
}
