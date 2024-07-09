package handlers

import (
	"net/http"

	"backend/api/auth"

	"github.com/gin-gonic/gin"
	"fmt"
)

type InsertUserBody struct {
	Email    string `json:"email"`
	Username string `json:"username"`
}

func (e *Env) InsertUser(c *gin.Context) {
	var body InsertUserBody

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}

	_, err := e.Db.NamedExec(`INSERT INTO users (email, username)
        VALUES (:email, :username)`,
		map[string]interface{}{
			"email":    body.Email,
			"username": body.Username,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Person inserted successfully"})
}

type User struct {
	Username string `json:"username"`
}

func (e *Env) GetUsers(c *gin.Context) {
	var users []User

	err := e.Db.Select(&users, "SELECT username FROM users")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": users})
}

type DeleteUserBody struct {
	Email string `json:"email"`
}

func (e *Env) DeleteUser(c *gin.Context) {
	var body DeleteUserBody

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}

	claims, exists := c.Get("authorizerClaims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	email := claims.(*auth.AuthorizerClaims).Email
	if email != body.Email {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	_, err := e.Db.NamedExec(`DELETE FROM users WHERE email = :email`, map[string]interface{}{
		"email": body.Email,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

type CreateMarkerBody struct {
	Email string `json:"email"`
	Lat float64 `json:"lat"`
	Long float64 `json:"long"`
	Base64Image string `json:"base64Image"`
}

func (e *Env) CreateMarker(c *gin.Context) {
	var body CreateMarkerBody

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}

	_, exists := c.Get("authorizerClaims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	fmt.Println(body)

	_, err := e.Db.NamedExec(`
	INSERT INTO Markers (userId, lat, long, base64Image)
		VALUES (:userId, :lat, :long, :base64Image);
	`, map[string]interface{}{
		"userId": body.UserId,
		"lat": body.Lat,
		"long": body.Long,
		"base64Image": body.Base64Image,
	})

	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}