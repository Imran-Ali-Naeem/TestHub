package utils

import (
	"time"
)

type JWTUtil struct {
	secretKey []byte
}

func NewJWTUtil(secret string) *JWTUtil {
	return &JWTUtil{
		secretKey: []byte(secret),
	}
}

func (j *JWTUtil) GenerateToken(userID, username string) (string, error) {
	// TODO: Implement JWT token generation
	return "", nil
}

func (j *JWTUtil) ValidateToken(token string) (map[string]interface{}, error) {
	// TODO: Implement JWT token validation
	return nil, nil
}

func (j *JWTUtil) RefreshToken(token string, duration time.Duration) (string, error) {
	// TODO: Implement JWT token refresh
	return "", nil
}
