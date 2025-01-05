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
