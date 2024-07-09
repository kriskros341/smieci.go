package main

import (
	"backend/api/auth"
	"backend/api/handlers"
	"backend/database"

	"backed/api/auth"
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

	router := gin.Default()
	router.Use(cors.Default())
	router.Use(auth.AuthMiddleware())

	env := &handlers.Env{Db: db}
	router.POST("/users/createUser", env.InsertUser)
	router.GET("/users/getUsers", env.GetUsers)
	router.POST("/users/deleteUser", env.DeleteUser)
	router.POST("/markers", env.CreateMarker)

	router.Run("0.0.0.0:8080")
}
