package main

import (
	"fmt"

	"backend/database"
	repositories "backend/repository"

	"backend/cron/src/consts"

	_ "github.com/lib/pq"
)

const INCREMENT = 10

func main() {
	fmt.Println("Updating available points...")
	db := database.Connect(consts.DATABASE_DOCKER_HOST)
	defer db.Close()

	Users := repositories.NewUsersRepository(db)

	affectedRows, err := Users.UpdateAvailablePoints(INCREMENT)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Printf("Available points updated successfully for %d users!\n", affectedRows)
}
