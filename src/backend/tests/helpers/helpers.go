package helpers

import (
	"backend/database"
	"testing"

	"github.com/jmoiron/sqlx"
)

func SetupTestDB(t *testing.T, query string) *sqlx.DB {
	db := database.Connect("localhost", "dbpass")

	_, err := db.Exec(query)
	if err != nil {
		t.Fatalf("Error executing query: %v", err)
	}

	return db
}
