package auth

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

type AuthorizerClaims struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Role     string `json:"role"`
	UserId   string `json:"user_id"`
	jwt.RegisteredClaims
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.Request.Header["Authorization"]

		println(strings.Contains(c.Request.URL.Path, "uploads"))
		if strings.Contains(c.Request.URL.Path, "uploads") {
			c.Next()
			return
		}
		if strings.Contains(c.Request.URL.Path, "webhook") {
			c.Next()
			return
		}
		if len(auth) == 0 {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Authorization header is missing"})
			return
		}
		splitAuth := strings.Split(auth[0], " ")
		if len(splitAuth) != 2 {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid Authorization header"})
			return
		}
		tokenType, token := splitAuth[0], splitAuth[1]
		if tokenType != "Bearer" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid Authorization header"})
			return
		}
		ctx, cancel := context.WithCancel(context.Background())

		jwks, err := keyfunc.NewDefaultCtx(ctx, []string{os.Getenv("CLERK_JWKS_URL")})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to create a keyfunc.Keyfunc from the server's URL."})
		}

		parsed, err := jwt.ParseWithClaims(token, &AuthorizerClaims{}, jwks.Keyfunc)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		} else if claims, ok := parsed.Claims.(*AuthorizerClaims); ok {
			c.Set("authorizerClaims", claims)
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		}

		cancel()
		c.Next()
	}
}
