package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type User struct {
	Email    string `json:"email"`
	Username string `json:"username"`
}

type Env struct {
	db *sqlx.DB
}

func main() {
	db, err := sqlx.Connect("postgres", "host=localhost port=5433 user=postgres password=dbpass sslmode=disable")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	env := &Env{db: db}
	router := gin.Default()
	router.Use(cors.Default())
	router.POST("/users/createUser", env.insertUser)

	router.Run("0.0.0.0:8080")
}

func (e *Env) insertUser(c *gin.Context) {
	var user User

	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}

	_, err := e.db.NamedExec(`INSERT INTO users (email, username)
        VALUES (:email, :username)`,
		map[string]interface{}{
			"email":    user.Email,
			"username": user.Username,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Person inserted successfully"})
}
