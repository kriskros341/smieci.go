package main

import (
	"fmt"

	"backend/database"
	"backend/integrations"
	repositories "backend/repository"
	//"log"
	"os"

	"backend/cron/src/consts"
	//"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	//err := godotenv.Load()
	//if err != nil {
	//	log.Fatal("Error loading .env file")
	//	return
	//}
	pass := os.Getenv("POSTGRES_PASSWORD")

	fmt.Println("Fetching government markers...")
	db := database.Connect(consts.DATABASE_DOCKER_HOST, pass)
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
