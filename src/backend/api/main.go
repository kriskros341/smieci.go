package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var schema = `
CREATE TABLE IF NOT EXISTS person (
    id serial primary key,
    first_name text,
    last_name text,
    email text
);
`

type Person struct {
	ID        int    `db:"id"`
	FirstName string `db:"first_name"`
	LastName  string `db:"last_name"`
	Email     string `db:"email"`
}

type Env struct {
	db *sqlx.DB
}

type album struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

var albums = []album{
	{ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

func main() {
	db, err := sqlx.Connect("postgres", "host=localhost port=5433 user=postgres password=dbpass sslmode=disable")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	db.MustExec(schema)

	env := &Env{db: db}
	router := gin.Default()
	router.Use(cors.Default())
	router.GET("/albums", getAlbums)
	router.POST("/insertPerson", env.insertPerson)

	router.Run("localhost:8080")
}

func getAlbums(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, albums)
}

func (e *Env) insertPerson(c *gin.Context) {
	_, err := e.db.NamedExec(`INSERT INTO person (first_name, last_name, email)
        VALUES (:first_name, :last_name, :email)`,
		map[string]interface{}{
			"first_name": "John",
			"last_name":  "Doe",
			"email":      "kczuba@gmail.com",
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Person inserted successfully"})
}
