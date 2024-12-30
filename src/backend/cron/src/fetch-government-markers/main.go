package main

import (
	"fmt"

	"backend/database"
	"backend/integrations"
	repositories "backend/repository"

	"backend/cron/src/consts"

	_ "github.com/lib/pq"
)

func main() {
	fmt.Println("Fetching government markers...")
	db := database.Connect(consts.DATABASE_DOCKER_HOST)
	defer db.Close()

	Markers := repositories.NewMarkerRepository(db)

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
