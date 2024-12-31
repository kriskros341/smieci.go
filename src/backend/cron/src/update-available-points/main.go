package main

import (
	"fmt"

	"backend/database"
	repositories "backend/repository"

	"backend/cron/src/consts"
	//"log"
	"os"

	//"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

const INCREMENT = 10

func main() {
	//err := godotenv.Load()
	//if err != nil {
	//	log.Fatal("Error loading .env file")
	//	return
	//}
	pass := os.Getenv("POSTGRES_PASSWORD")
	fmt.Println("Updating available points...")
	db := database.Connect(consts.DATABASE_DOCKER_HOST, pass)
	defer db.Close()

	Users := repositories.NewUsersRepository(db)

	affectedRows, err := Users.UpdateAvailablePoints(INCREMENT)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Printf("Available points updated successfully for %d users!\n", affectedRows)
}
