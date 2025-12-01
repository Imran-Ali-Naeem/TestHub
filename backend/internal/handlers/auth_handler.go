package handlers

/**
 * User Handler
 * 
 * Purpose: Handle HTTP requests for user operations
 * This layer receives HTTP requests and sends responses
 * 
 * Endpoints:
 * - POST /api/users/signup: Create new user account
 * - POST /api/auth/login: Login with email/password
 * - GET  /api/auth/me: Get current user info
 * - POST /api/users/set-password: Set password for OAuth users
 * 
 * Note: Returns JSON responses with proper status codes
 */

import (
	"encoding/json"
	"net/http"

	"backend/internal/middleware"
	"backend/internal/services"
)

type UserHandler struct {
	userService *services.UserService
	jwtService  *services.JWTService
}

// NewUserHandler creates a new user handler instance
func NewUserHandler(userService *services.UserService, jwtService *services.JWTService) *UserHandler {
	return &UserHandler{
		userService: userService,
		jwtService:  jwtService,
	}
}

// SignupRequest represents the JSON body for signup
type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Response represents a standard JSON response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Signup handles user registration
// POST /api/users/signup
func (h *UserHandler) Signup(w http.ResponseWriter, r *http.Request) {
	// Set response header
	w.Header().Set("Content-Type", "application/json")

	// Handle OPTIONS request for CORS
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// ==================================================
	// PARSE REQUEST
	// ==================================================
	
	var req SignupRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// ==================================================
	// CREATE USER
	// ==================================================
	
	// Create service request (username = name for now)
	serviceReq := services.SignupRequest{
		Username: req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	user, err := h.userService.CreateUser(r.Context(), serviceReq)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// ==================================================
	// GENERATE JWT TOKEN
	// ==================================================
	
	token, err := h.jwtService.GenerateToken(user.ID, user.Email, user.Username, user.Role)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "User created but failed to generate token",
		})
		return
	}

	// ==================================================
	// SUCCESS RESPONSE
	// ==================================================
	
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "User created successfully",
		Data: map[string]interface{}{
			"token": token,
			"user": map[string]string{
				"id":       user.ID,
				"email":    user.Email,
				"username": user.Username,
				"role":     user.Role,
			},
		},
	})
}

// SetPasswordRequest represents the request to set password for Google OAuth users
type SetPasswordRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SetPassword allows Google OAuth users to set a password for email/password login
// Endpoint: POST /api/users/set-password
func (h *UserHandler) SetPassword(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req SetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Email and password are required",
		})
		return
	}

	if len(req.Password) < 6 {
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Password must be at least 6 characters",
		})
		return
	}

	// Update user password via service
	err := h.userService.SetUserPassword(r.Context(), req.Email, req.Password)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "Password set successfully",
	})
}

// LoginRequest represents the login request
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login handles user login with email/password
// Endpoint: POST /api/auth/login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Validate credentials via service
	user, err := h.userService.LoginUser(r.Context(), req.Email, req.Password)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Generate JWT token
	token, err := h.jwtService.GenerateToken(user.ID, user.Email, user.Username, user.Role)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Failed to generate token",
		})
		return
	}

	// Success response with JWT token
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "Login successful",
		Data: map[string]interface{}{
			"token": token,
			"user": map[string]string{
				"id":       user.ID,
				"email":    user.Email,
				"username": user.Username,
				"role":     user.Role,
			},
		},
	})
}

// GetCurrentUser returns the currently authenticated user's information
// Endpoint: GET /api/auth/me (Protected - requires JWT)
func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	// Extract user claims from context (set by auth middleware)
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	// Return user information
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "User retrieved successfully",
		Data: map[string]string{
			"id":       claims.UserID,
			"email":    claims.Email,
			"username": claims.Username,
			"role":     claims.Role,
		},
	})
}

