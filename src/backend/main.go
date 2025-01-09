package main

import (
	"backend/api/auth"
	"backend/api/handlers"
	"backend/database"
	"backend/helpers"
	repositories "backend/repository"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"backend/integrations"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	_ "github.com/lib/pq"
	svix "github.com/svix/svix-webhooks/go"
)

type EmailPayload struct {
	EmailAddress string `json:"email_address"`
}

// Define a struct that matches the JSON response
type ClerkUserResponse struct {
	UserID          string         `json:"id"`
	Username        string         `json:"username"`
	Emails          []EmailPayload `json:"email_addresses"`
	ProfileImageURL string         `json:"profile_image_url"`
}

func SyncUsers(e *handlers.Env) error {
	CLERK_API_SECRET_KEY := os.Getenv("CLERK_API_SECRET_KEY")
	CLERK_SERVICE_URL := os.Getenv("CLERK_SERVICE_URL")
	url := fmt.Sprintf("%s/v1/users", CLERK_SERVICE_URL)

	// Create a new GET request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return err
	}

	// Set the Authorization header
	req.Header.Set("Authorization", "Bearer "+CLERK_API_SECRET_KEY)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error making request: %v\n", err)
		return err
	}

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response body: %v\n", err)
		return err
	}
	defer resp.Body.Close()

	// Parse the JSON response into the struct
	var users []ClerkUserResponse
	if err := json.Unmarshal(body, &users); err != nil {
		fmt.Printf("Error unmarshalling JSON: %v\n", err)
		return err
	}
	var rows []string
	for _, user := range users {
		primaryEmail := user.Emails[0].EmailAddress
		row := fmt.Sprintf(`('%s', '%s', '%s', '%s')`, user.UserID, user.Username, user.ProfileImageURL, primaryEmail)
		rows = append(rows, row)
	}

	if len(rows) == 0 {
		return nil
	}

	query := fmt.Sprintf(`INSERT INTO users (id, username, profileimageurl, email) VALUES %s ON CONFLICT (id) DO
		UPDATE SET username = EXCLUDED.username, email = EXCLUDED.email, profileimageurl = EXCLUDED.profileimageurl;`, strings.Join(rows, ","))

	newUsers, err := e.Db.Exec(query)
	if err != nil {
		fmt.Printf("Sync users error: %v\n", err)
		return err
	}

	rowsAffected, err := newUsers.RowsAffected()

	if err != nil {
		fmt.Printf("Error unmarshalling JSON: %v\n", err)
		return err
	}

	println(fmt.Sprintln(rowsAffected, "users synchronized with clerk!"))

	return nil
}

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

	cwd, err := os.Getwd()
	if err != nil {
		println("Error getting current working directory:", err)
		return
	}
	println("Uploads will be placed in %s/uploads", cwd)

	WEBHOOK_SECRET := os.Getenv("WEBHOOK_SECRET")
	wh, err := svix.NewWebhook(WEBHOOK_SECRET)
	println("created webhook handler with secret", WEBHOOK_SECRET)
	if err != nil {
		log.Fatal(err)
	}

	router := gin.Default()
	router.Use(cors.Default())
	router.Use(auth.AuthMiddleware())

	Markers := repositories.NewMarkerRepository(db)
	Solutions := repositories.NewSolutionsRepository(db)
	Uploads := repositories.NewUploadsRepository(db)
	Users := repositories.NewUsersRepository(db)
	Leaderboard := repositories.NewLeaderboardRepository(db)

	env := &handlers.Env{
		Db:          db,
		Wh:          wh,
		Markers:     Markers,
		Solutions:   Solutions,
		Uploads:     Uploads,
		Users:       Users,
		Leaderboard: Leaderboard,
	}

	if os.Getenv("ENVIRONMENT") == "dev" {
		err = SyncUsers(env)
		if err != nil {
			return
		}
	}
	markers, err := integrations.GetAllGovMarkers()
	if err != nil {
		log.Fatal(err)
		return
	}

	count, err := env.Markers.UpsertExternalMarkers(markers)
	if err != nil {
		fmt.Println(fmt.Errorf("failed to fetch markers from .gov integration %w", err))
	} else {
		fmt.Printf("%d markers upserted from .gov datasources\n\n", count)
	}

	router.GET("/users/getUsers", env.GetUsers)
	router.GET("/users/current/permissions", env.GetCurrentUserPermissions)
	router.GET("/users/:userId", env.GetUserById)
	router.POST("/markers", env.CreateMarker)
	router.GET("/markers/:markerId", env.GetMarkerById)
	router.PATCH("/markers/:markerId/uploads", env.PatchMarkerPhotos)
	router.POST("/markers/:markerId/solve", env.PostMarkerSolution) // do przeniesienia jako solutions/create
	router.POST("/markers/:markerId/status", env.SetMarkerStatus)
	router.GET("/markers/:markerId/supporters", env.GetMarkerSupporters)
	router.GET("/markers", env.GetMarkers)
	router.GET("/markers/region", env.GetMarkersInRegion)
	router.PUT("/markers/support", env.SupportMarker)
	router.GET("/solutions/:solutionId", env.GetSolution)
	router.POST("/solutions/:solutionId/status", env.SetSolutionStatus)
	router.GET("/uploads/:uploadId", env.GetFile)
	router.POST("/webhook", env.HandleEvent)
	router.GET("/leaderboard", env.GetLeaderboardByType)

	router.Run(":8080")
}
