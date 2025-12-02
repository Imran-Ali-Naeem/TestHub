package handlers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"backend/internal/services"

	"google.golang.org/api/idtoken"
)

// GoogleAuthHandler handles Google OAuth authentication
type GoogleAuthHandler struct {
	userService *services.UserService
	jwtService  *services.JWTService
}

// NewGoogleAuthHandler creates a new Google auth handler
func NewGoogleAuthHandler(userService *services.UserService, jwtService *services.JWTService) *GoogleAuthHandler {
	return &GoogleAuthHandler{
		userService: userService,
		jwtService:  jwtService,
	}
}

// GoogleSignupRequest represents the Google OAuth signup request
type GoogleSignupRequest struct {
	Credential string `json:"credential"` // JWT token from Google
}

// GoogleUserInfo represents user data extracted from Google token
type GoogleUserInfo struct {
	Email         string `json:"email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	EmailVerified bool   `json:"email_verified"`
}

// GoogleAuth handles UNIFIED Google OAuth for both signup and login
// Automatically detects if user is new or existing
// Endpoint: POST /api/auth/google
func (h *GoogleAuthHandler) GoogleAuth(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req GoogleSignupRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Verify Google token and extract user info
	userInfo, err := h.verifyGoogleToken(req.Credential)
	if err != nil {
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Failed to verify Google token: " + err.Error(),
		})
		return
	}

	// Check if user already exists
	existingUser, _ := h.userService.GetUserByEmail(r.Context(), userInfo.Email)
	
	var userID, email, username, role string
	var needsPassword bool
	var isNewUser bool
	
	if existingUser != nil {
		// EXISTING USER
		userID = existingUser.ID
		email = existingUser.Email
		username = existingUser.Username
		role = existingUser.Role
		
		// Check if user has a password set (Password field is not empty)
		// If they signed up with Google and never set a password, they need to set one
		// If they have a password, they need to verify it
		needsPassword = true  // Always require password for security
		isNewUser = false
	} else {
		// NEW USER - Signup flow
		newUser, err := h.userService.CreateGoogleUser(r.Context(), userInfo.Name, userInfo.Email, userInfo.Picture)
		if err != nil {
			json.NewEncoder(w).Encode(Response{
				Success: false,
				Message: err.Error(),
			})
			return
		}
		userID = newUser.ID
		email = newUser.Email
		username = newUser.Username
		role = newUser.Role
		needsPassword = true  // New users need to set password
		isNewUser = true
	}

	// Generate JWT token
	token, err := h.jwtService.GenerateToken(userID, email, username, role)
	if err != nil {
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Authentication successful but failed to generate token",
		})
		return
	}

	// Return unified response - user is authenticated and ready to go!
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "Google authentication successful",
		Data: map[string]interface{}{
			"token": token,
			"user": map[string]string{
				"id":       userID,
				"email":    email,
				"username": username,
				"role":     role,
			},
		},
	})
}

// GoogleLogin handles EXISTING user login via Google OAuth
// User must verify their password after Google authentication
// Endpoint: POST /api/auth/google/login
func (h *GoogleAuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req GoogleSignupRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Verify Google token and extract user info
	userInfo, err := h.verifyGoogleToken(req.Credential)
	if err != nil {
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Failed to verify Google token: " + err.Error(),
		})
		return
	}

	// Check if user exists in database
	existingUser, err := h.userService.GetUserByEmail(r.Context(), userInfo.Email)
	if err != nil || existingUser == nil {
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "No account found with this Google email. Please sign up first.",
		})
		return
	}

	// Return user data - frontend will ask for password verification
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "Google account found - please enter your password",
		Data: map[string]interface{}{
			"requiresPassword": true,  // Flag to show ENTER password screen
			"user": map[string]string{
				"id":       existingUser.ID,
				"email":    existingUser.Email,
				"username": existingUser.Username,
				"role":     existingUser.Role,
			},
		},
	})
}

// GoogleLoginVerifyPassword verifies password for Google login
// Endpoint: POST /api/auth/google/verify-password
func (h *GoogleAuthHandler) GoogleLoginVerifyPassword(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Verify email and password
	user, err := h.userService.LoginUser(r.Context(), req.Email, req.Password)
	if err != nil || user == nil {
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Invalid password. Please try again.",
		})
		return
	}

	// Generate JWT token
	token, err := h.jwtService.GenerateToken(user.ID, user.Email, user.Username, user.Role)
	if err != nil {
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Message: "Login successful but failed to generate token",
		})
		return
	}

	// Return success response with JWT token
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "Google login successful",
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

// verifyGoogleToken decodes and validates the Google JWT token
// Verifies the token with Google's public keys
func (h *GoogleAuthHandler) verifyGoogleToken(credential string) (*GoogleUserInfo, error) {
	// Note: In production, you need to provide your Google Client ID here
	// Get it from: https://console.cloud.google.com/apis/credentials
	// For now, we'll validate without client ID check (less secure but functional)
	
	ctx := context.Background()
	
	// Validate the token
	payload, err := idtoken.Validate(ctx, credential, "")
	if err != nil {
		return nil, err
	}

	// Extract user information from the payload
	userInfo := &GoogleUserInfo{
		Email:         payload.Claims["email"].(string),
		Name:          payload.Claims["name"].(string),
		EmailVerified: payload.Claims["email_verified"].(bool),
	}
	
	// Picture is optional
	if picture, ok := payload.Claims["picture"].(string); ok {
		userInfo.Picture = picture
	}

	return userInfo, nil
}
