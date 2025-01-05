package main

import (
	"fmt"
	"log"

	"backend/database"
	"backend/helpers"
	repositories "backend/repository"

	"os"

	_ "github.com/lib/pq"
)

const INCREMENT = 10

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

	Users := repositories.NewUsersRepository(db)

	fmt.Println("Updating available points...")
	affectedRows, err := Users.UpdateAvailablePoints(INCREMENT)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Printf("Available points updated successfully for %d users!\n", affectedRows)
}
