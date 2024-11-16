package handlers

import (
	"backend/api/auth"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (e *Env) GetUsers(c *gin.Context) {
	users, err := e.Users.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": users})
}

type GetUserByClerIdPayload struct {
	UserId string `uri:"userId" binding:"required"`
}

func (e *Env) GetUserById(c *gin.Context) {
	var getUserPayload GetUserByClerIdPayload

	if err := c.ShouldBindUri(&getUserPayload); err != nil {
		var error = gin.H{"error": err.Error()}
		fmt.Println(error)
		c.JSON(http.StatusBadRequest, error)
		return
	}

	user, err := e.Users.GetUserById(getUserPayload.UserId)
	if err != nil {
		var e = gin.H{"error": err.Error()}
		fmt.Println(e)
		c.JSON(http.StatusNotFound, e)
		return
	}

	c.JSON(http.StatusOK, user)
}

func (e *Env) GetCurrentUserPermissions(c *gin.Context) {

	claims, exists := c.Get("authorizerClaims")

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "No claim"})
		return
	}

	userId := claims.(*auth.AuthorizerClaims).UserId
	permissions, err := e.Users.GetPermissionsByUserId(userId)
	if err != nil {
		var e = gin.H{"error": err.Error()}
		fmt.Println(e)
		c.JSON(http.StatusInternalServerError, e)
		return
	}
	c.JSON(http.StatusOK, permissions)
}
