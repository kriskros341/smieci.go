package helpers

import (
	"backend/api/auth"
	"backend/database"
	"errors"
	"fmt"
	"slices"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func Authorize(db *sqlx.DB, claims *auth.AuthorizerClaims, permission database.Permission) error {
	userId := claims.UserId
	var permissions []database.Permission
	query := fmt.Sprintf("SELECT p.pname FROM permissions p JOIN users_permissions_relation upr on p.id = upr.permissionId where upr.userId = '%s'", userId)
	fmt.Println("Executing query:", query)
	err := db.Select(&permissions, query)
	if err != nil {
		return err
	}

	if !slices.Contains(permissions, permission) {
		return errors.New("unauthorized")
	}

	return nil
}

func GetUserIdFromSession(c *gin.Context) (string, error) {
	// Authorize user
	claims, exists := c.Get("authorizerClaims")
	if !exists {
		return "", errors.New("Unauthorized")
	}

	var clerkId = claims.(*auth.AuthorizerClaims).UserId
	return clerkId, nil
}
