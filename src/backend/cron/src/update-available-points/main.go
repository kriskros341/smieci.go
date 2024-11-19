package main

import (
	"fmt"

	"backend/database"
	repositories "backend/repository"

	_ "github.com/lib/pq"
)

const INCREMENT = 10

func main() {
	db := database.Connect("postgres")
	defer db.Close()

	Users := repositories.NewUsersRepository(db)

	affectedRows, err := Users.UpdateAvailablePoints(INCREMENT)
	if err != nil {
		fmt.Println(err)
	}

	fmt.Printf("Available points updated successfully for %d users!\n", affectedRows)
}
