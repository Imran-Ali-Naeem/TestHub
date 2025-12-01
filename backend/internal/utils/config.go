package utils

import (
	"os"
)

type Config struct {
	Port          string
	DatabaseURL   string
	RedisURL      string
	JWTSecret     string
	Environment   string
}

func LoadConfig() *Config {
	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DATABASE_URL", ""),
		RedisURL:      getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:     getEnv("JWT_SECRET", "your-secret-key"),
		Environment:   getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
