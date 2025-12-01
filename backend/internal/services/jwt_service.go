package services

/**
 * JWT Service
 * 
 * Purpose: Handle JWT token generation and verification
 * This service provides authentication tokens for users
 * 
 * Operations:
 * - GenerateToken: Create JWT token with user claims
 * - VerifyToken: Validate JWT token
 * - ExtractClaims: Get user data from token
 */

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT secret key - In production, load this from environment variable
const jwtSecret = "your-secret-key-change-this-in-production"

// TokenClaims represents the JWT claims structure
type TokenClaims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// JWTService handles JWT operations
type JWTService struct{}

// NewJWTService creates a new JWT service instance
func NewJWTService() *JWTService {
	return &JWTService{}
}

// GenerateToken creates a new JWT token for a user
// Token expires in 24 hours
func (s *JWTService) GenerateToken(userID, email, username, role string) (string, error) {
	// Set token expiration to 24 hours from now
	expirationTime := time.Now().Add(24 * time.Hour)

	// Create token claims
	claims := &TokenClaims{
		UserID:   userID,
		Email:    email,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "testops-backend",
		},
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with secret key
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// VerifyToken validates a JWT token and returns the claims
func (s *JWTService) VerifyToken(tokenString string) (*TokenClaims, error) {
	// Parse the token
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	// Extract claims
	claims, ok := token.Claims.(*TokenClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	// Check if token is expired
	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("token expired")
	}

	return claims, nil
}

// ExtractClaims extracts claims from token without full validation
// Useful for getting user info even if token is expired
func (s *JWTService) ExtractClaims(tokenString string) (*TokenClaims, error) {
	token, _, err := jwt.NewParser().ParseUnverified(tokenString, &TokenClaims{})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*TokenClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}
