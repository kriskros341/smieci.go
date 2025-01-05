package main

import (
	"fmt"

	"backend/database"
	"backend/helpers"
	"backend/integrations"
	repositories "backend/repository"

	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	err := helpers.LoadEnvsIfNotLoaded()
	if err != nil {
		log.Fatal("Error loading .env file")
		return
	}

	pass := os.Getenv("POSTGRES_PASSWORD")
	host := os.Getenv("HOST")
	db := database.Connect(host, pass)
	defer db.Close()

	Markers := repositories.NewMarkerRepository(db)

	fmt.Println("Fetching government markers...")
	govermentMarkers, err := integrations.GetAllGovMarkers()
	if err != nil {
		fmt.Println("Error getting government markers: ", err)
		return
	}

	affectedRows, err := Markers.UpsertExternalMarkers(govermentMarkers)
	if err != nil {
		fmt.Println("Error upserting government markers: ", err)
		return
	}

	fmt.Printf("Government markers upserted succesfully! Updated %d rows.\n", affectedRows)
}
