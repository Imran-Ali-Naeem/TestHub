package main

/**
 * Backend API Entry Point
 * 
 * Purpose: Main entry point for the TestOps backend API
 * This handles all HTTP requests and routes them to appropriate handlers
 * 
 * For now: Only user signup functionality is implemented
 * No JWT authentication yet - keeping it simple for basic database connection
 */

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/services"
)

func main() {
	// ==================================================
	// ENVIRONMENT CONFIGURATION
	// ==================================================
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mongoURL := os.Getenv("MONGO_URL")
	if mongoURL == "" {
		mongoURL = "mongodb://admin:admin123@localhost:27017"
	}

	log.Println("=== Starting TestOps Backend API ===")
	log.Printf("Port: %s", port)
	log.Printf("MongoDB URL: %s", mongoURL)

	// ==================================================
	// DATABASE CONNECTION
	// ==================================================
	log.Println("Connecting to MongoDB...")
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Create MongoDB client
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURL))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Ping the database to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	log.Println("✓ Successfully connected to MongoDB")

	// Get database instance
	database := client.Database("testops")

	// ==================================================
	// INITIALIZE LAYERS (Repository -> Service -> Handler -> Middleware)
	// ==================================================
	
	// Repository Layer - Direct database operations
	userRepo := repository.NewUserRepository(database)
	
	// Service Layer - Business logic
	userService := services.NewUserService(userRepo)
	jwtService := services.NewJWTService()
	
	// Middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtService)
	
	// Handler Layer - HTTP request handling
	userHandler := handlers.NewUserHandler(userService, jwtService)
	googleAuthHandler := handlers.NewGoogleAuthHandler(userService, jwtService)

	// ==================================================
	// ROUTER SETUP
	// ==================================================
	router := mux.NewRouter()

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	// API routes
	api := router.PathPrefix("/api").Subrouter()
	
	// Public routes (no authentication required)
	api.HandleFunc("/users/signup", userHandler.Signup).Methods("POST", "OPTIONS")
	api.HandleFunc("/users/set-password", userHandler.SetPassword).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/login", userHandler.Login).Methods("POST", "OPTIONS")
	
	// Unified Google OAuth route - handles both signup and login automatically
	api.HandleFunc("/auth/google", googleAuthHandler.GoogleAuth).Methods("POST", "OPTIONS")
	
	// Protected routes (authentication required)
	api.HandleFunc("/auth/me", authMiddleware.Authenticate(userHandler.GetCurrentUser)).Methods("GET", "OPTIONS")

	// ==================================================
	// CORS CONFIGURATION
	// ==================================================
	// Allow frontend to communicate with backend
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:3456", "http://localhost:3457"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	// ==================================================
	// START SERVER
	// ==================================================
	log.Printf("✓ Server starting on port %s", port)
	log.Println("✓ Endpoints available:")
	log.Println("  GET  /health")
	log.Println("  POST /api/users/signup (returns JWT)")
	log.Println("  POST /api/auth/login (returns JWT)")
	log.Println("  POST /api/auth/google (unified - auto-detects new/existing user)")
	log.Println("  POST /api/users/set-password")
	log.Println("  GET  /api/auth/me (protected)")
	
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
