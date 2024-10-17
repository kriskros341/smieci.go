package main

import (
	"backend/api/auth"
	"backend/api/handlers"
	"backend/database"
	"os"

	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	svix "github.com/svix/svix-webhooks/go"
)

func main() {
	err := godotenv.Load()
	WEBHOOK_SECRET := os.Getenv("WEBHOOK_SECRET")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	db := database.Connect()
	defer db.Close()

	cwd, err := os.Getwd()
	if err != nil {
		println("Error getting current working directory:", err)
		return
	}
	println("Uploads will be placed in %s/uploads", cwd)

	wh, err := svix.NewWebhook(WEBHOOK_SECRET)
	println("created webhook handler with secret", WEBHOOK_SECRET)
	if err != nil {
		log.Fatal(err)
	}

	router := gin.Default()
	router.Use(cors.Default())
	router.Use(auth.AuthMiddleware())

	env := &handlers.Env{Db: db, Wh: wh}
	router.POST("/users/createUser", env.InsertUser)
	router.GET("/users/getUsers", env.GetUsers)
	router.GET("/users/:userId", env.GetUser)
	router.GET("/users/clerk/:clerkId", env.GetUserByClerkId)
	router.POST("/users/deleteUser", env.DeleteUser)
	router.POST("/markers", env.CreateMarker)
	router.GET("/markers/:markerId", env.GetMarker)
	router.GET("/markers/:markerId/supporters", env.GetMarkerSupporters)
	router.GET("/markers", env.GetMarkersCoordinates)
	router.PUT("/markers/support", env.SupportMarker)
	router.GET("/uploads/:uploadId", env.GetFile)
	router.POST("/webhook", env.HandleEvent)

	router.Run("0.0.0.0:8080")
}
