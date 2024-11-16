package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

type WebhookBase struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

type EmailAddress struct {
	ID           string `json:"id"`
	EmailAddress string `json:"email_address"`
}

type UserCreatedData struct {
	ID              string         `json:"id"`
	EmailAddresses  []EmailAddress `json:"email_addresses"`
	Username        *string        `json:"username"` // Pointer to handle potential null value
	ProfileImageURL string         `json:"profile_image_url"`
}

type UserDeletedData struct {
	Deleted bool   `json:"deleted"`
	ID      string `json:"id"`
}

// Helper function to handle nullable string values
func nullToSQLString(s *string) string {
	if s == nil {
		return "NULL"
	}
	return *s
}

func (e *Env) HandleEvent(c *gin.Context) {
	headers := c.Request.Header
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		println("Failed to read body")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = e.Wh.Verify(payload, headers)
	if err != nil {
		println("Failed to verify webhook")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var event WebhookBase
	err = json.Unmarshal(payload, &event)
	if err != nil {
		println("Failed to parse JSON")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse JSON"})
		return
	}

	println("Received webhook event:", event.Type)

	switch event.Type {
	case "user.created":
		var userData UserCreatedData
		if err := json.Unmarshal(event.Data, &userData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user.created data"})
			return
		}

		query := `INSERT INTO users (clerkId, email, username, points, supportPoints, profileImageURL) VALUES (:clerkId, :email, :username, :points, :supportPoints, :profileImageURL)`
		data := map[string]interface{}{
			"clerkId":         userData.ID,
			"email":           userData.EmailAddresses[0].EmailAddress,
			"username":        userData.Username,
			"points":          0,
			"supportPoints":   0,
			"profileImageURL": userData.ProfileImageURL,
		}
		println("Executing query: ", query, " with struct", data)
		_, err := e.Db.NamedExec(query, data)

		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		fmt.Printf("User Created Event: ID=%s, Email=%s\n", userData.ID, userData.EmailAddresses[0].EmailAddress)
		c.JSON(200, gin.H{})
		return
	case "user.updated":
		var userData UserCreatedData
		if err := json.Unmarshal(event.Data, &userData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user.created data"})
			return
		}
		query := fmt.Sprintf(`UPDATE users SET email='%s', username='%s', profileImageURL='%s' WHERE clerkId='%s'`,
			userData.EmailAddresses[0].EmailAddress,
			nullToSQLString(userData.Username),
			userData.ProfileImageURL,
			userData.ID,
		)

		println("executing query:", query)
		result, err := e.Db.Exec(query)

		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if rowsAffected == 0 {
			fmt.Println("User not found")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
			return
		}
		fmt.Printf("User Updated Event: ID=%s, Email=%s\n", userData.ID, userData.EmailAddresses[0].EmailAddress)
		c.JSON(200, gin.H{})
		return
	case "user.deleted":
		var userData UserDeletedData
		if err := json.Unmarshal(event.Data, &userData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user.created data"})
			return
		}
		query := fmt.Sprintf(`UPDATE users SET deleted=%t WHERE clerkId = %s`,
			userData.Deleted,
			userData.ID,
		)

		println("executing query:", query)
		result, err := e.Db.Exec(query)

		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if rowsAffected == 0 {
			fmt.Println("User not found")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
			return
		}
		fmt.Printf("User Updated Event: ID=%s, Deleted=%t\n", userData.ID, userData.Deleted)
		c.JSON(200, gin.H{})
		return
	}
	c.JSON(200, gin.H{})
}
