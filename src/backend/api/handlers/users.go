package handlers

import (
	"backend/api/auth"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type InsertUserBody struct {
	Email    string `json:"email"`
	Username string `json:"username"`
}

func (e *Env) InsertUser(c *gin.Context) { // DEPRECATED
	var body InsertUserBody

	if err := c.BindJSON(&body); err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}
	fmt.Println(body)

	_, err := e.Db.NamedExec(`INSERT INTO users (email, username)
        VALUES (:email, :username)`,
		map[string]interface{}{
			"email":    body.Email,
			"username": body.Username,
		},
	)

	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Person inserted successfully"})
}

type User struct {
	Id       int32  `json:"id"`
	Username string `json:"username"`
	Points   int32  `json:"points"`
}

func (e *Env) GetUsers(c *gin.Context) {
	var users []User

	err := e.Db.Select(&users, "SELECT id, username, points FROM users")
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

type GetUserPayload struct {
	UserId string `uri:"userId" binding:"required"`
}

func (e *Env) GetUser(c *gin.Context) {
	var user User

	var getUserPayload GetUserPayload

	if err := c.ShouldBindUri(&getUserPayload); err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusBadRequest, error)
		return
	}

	userId := getUserPayload.UserId
	query := "SELECT username FROM users WHERE id = $1"
	fmt.Println("Executing query:", query, "with userId:", userId)
	err := e.Db.Get(&user, query, userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

type GetUserByClerIdPayload struct {
	ClerkId string `uri:"clerkId" binding:"required"`
}

func (e *Env) GetUserByClerkId(c *gin.Context) {
	var user User

	var getUserPayload GetUserByClerIdPayload

	if err := c.ShouldBindUri(&getUserPayload); err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusBadRequest, error)
		return
	}

	ClerkId := getUserPayload.ClerkId
	query := "SELECT id, username, points FROM users WHERE clerkid = $1"
	fmt.Println("Executing query:", query, "with userId:", ClerkId)
	err := e.Db.Get(&user, query, ClerkId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}
