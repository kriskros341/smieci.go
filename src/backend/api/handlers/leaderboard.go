package handlers

import (
	"fmt"
	"net/http"

	"backend/models"

	"github.com/gin-gonic/gin"
)

type getLeaderboardByTypePayload struct {
	LeaderboardType models.LeaderboardType `form:"leaderboardType" json:"leaderboardType" binding:"required"`
}

func (e *Env) GetLeaderboardByType(c *gin.Context) {
	var payload getLeaderboardByTypePayload

	if err := c.Bind(&payload); err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusBadRequest, error)
		return
	}

	leaderboard, err := e.Leaderboard.GetLeaderboardByType(payload.LeaderboardType)
	if err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusInternalServerError, error)
		return
	}

	c.JSON(http.StatusOK, leaderboard)
}
