package main

import (
	"backend/api/auth"
	"backend/api/handlers"
	"backend/database"
	"fmt"
	"os"

	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	db := database.Connect()
	defer db.Close()

	cwd, err := os.Getwd()
	if err != nil {
		fmt.Println("Error getting current working directory:", err)
		return
	}
	fmt.Printf("Uploads will be placed in %s/uploads", cwd)

	router := gin.Default()
	router.Use(cors.Default())
	router.Use(auth.AuthMiddleware())

	env := &handlers.Env{Db: db}
	router.POST("/users/createUser", env.InsertUser)
	router.GET("/users/getUsers", env.GetUsers)
	router.GET("/users/:userId", env.GetUser)
	router.POST("/users/deleteUser", env.DeleteUser)
	router.POST("/markers", env.CreateMarker)
	router.GET("/markers/:markerId", env.GetMarker)
	router.GET("/markers", env.GetMarkersCoordinates)
	router.GET("/uploads/:uploadId", env.GetFile)

	router.Run("0.0.0.0:8080")
}
