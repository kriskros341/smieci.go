package handlers

import (
	"net/http"

	"backend/api/auth"

	"github.com/gin-gonic/gin"
	"fmt"
)

type MarkerCoordinates struct {
	Lat float64 `json:"lat"`
	Long float64 `json:"long"`
}

func (e *Env) GetMarkersCoordinates(c *gin.Context) {
	var markers []MarkerCoordinates

	err := e.Db.Select(&markers, "SELECT lat, long FROM markers")
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	c.JSON(http.StatusOK, markers)
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

	fmt.Println(clerkId)
	_, err := e.Db.NamedExec(`
	INSERT INTO Markers (userId, lat, long, base64Image)
		VALUES (
			(SELECT id FROM Users WHERE clerkId = :clerkId),
			:lat,
			:long,
			:base64Image
		);
	`, map[string]interface{}{
		"clerkId": clerkId,
		"lat": body.Lat,
		"long": body.Long,
		"base64Image": body.Base64Image,
	})

	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Marker created successfully"})
}