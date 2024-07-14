package handlers

import (
	"net/http"

	"backend/api/auth"

	"github.com/gin-gonic/gin"
	"fmt"
)

type MarkerCoordinates struct {
	Id int64 `json:"id"`
	Lat float64 `json:"lat"`
	Long float64 `json:"long"`
}

func (e *Env) GetMarkersCoordinates(c *gin.Context) {
	var markers []MarkerCoordinates

	err := e.Db.Select(&markers, "SELECT id, lat, long FROM markers")
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	c.JSON(http.StatusOK, markers)
}

type GetMarkerPayload struct {
	Id int64 `json:"id"`
	Lat float64 `json:"lat"`
	Long float64 `json:"long"`
	Base64Image string `json:"base64Image"`
	UserId int64 `json:"userId"`
}

type GetMarkerRequestPayload struct {
	MarkerId string `uri:"markerId" binding:"required"`
}

func (e *Env) GetMarker(c *gin.Context) {
	var markerRequestPayload GetMarkerRequestPayload
	var marker GetMarkerPayload

	if err := c.ShouldBindUri(&markerRequestPayload); err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusBadRequest, error)
		return
	}

	markerId := markerRequestPayload.MarkerId
	query := "SELECT id, lat, long, base64Image, userId FROM markers WHERE id = $1"
	fmt.Println("Executing query:", query, "with markerId:", markerId)

	err := e.Db.Get(&marker, query, markerId)
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	c.JSON(http.StatusOK, marker)
}

type CreateMarkerBody struct {
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

	claims, exists := c.Get("authorizerClaims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	
	var clerkId = claims.(*auth.AuthorizerClaims).UserId

	data := map[string]interface{}{
		"clerkId": clerkId,
		"lat": body.Lat,
		"long": body.Long,
		"base64Image": body.Base64Image,
	}
	query := `
	INSERT INTO Markers (userId, lat, long, base64Image)
		VALUES (
			(SELECT id FROM Users WHERE clerkId = :clerkId),
			:lat,
			:long,
			:base64Image
		);
	`
	fmt.Println("Executing query:", query, "with data:", data)
	fmt.Println(clerkId)
	_, err := e.Db.NamedExec(query, data)

	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Marker created successfully"})
}