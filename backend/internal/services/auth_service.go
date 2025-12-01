package services

/**
 * User Service
 * 
 * Purpose: Handle business logic for user operations
 * This layer sits between handlers and repository
 * 
 * Operations:
 * - CreateUser: Validate and create new user
 * - LoginUser: Validate credentials and return user
 * - Automatically sets role to "tester"
 * - Validates email and username uniqueness
 */

import (
	"context"
	"errors"
	"strings"

	"backend/internal/models"
	"backend/internal/repository"
)

type UserService struct {
	userRepo *repository.UserRepository
}

// NewUserService creates a new user service instance
func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// SignupRequest represents the data needed for user signup
type SignupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// CreateUser validates input and creates a new user in the database
func (s *UserService) CreateUser(ctx context.Context, req SignupRequest) (*models.User, error) {
	// ==================================================
	// VALIDATION
	// ==================================================
	
	// Validate required fields
	if strings.TrimSpace(req.Username) == "" {
		return nil, errors.New("username is required")
	}
	if strings.TrimSpace(req.Email) == "" {
		return nil, errors.New("email is required")
	}
	if strings.TrimSpace(req.Password) == "" {
		return nil, errors.New("password is required")
	}

	// Check if email already exists
	emailExists, err := s.userRepo.CheckEmailExists(ctx, req.Email)
	if err != nil {
		return nil, errors.New("failed to check email existence")
	}
	if emailExists {
		return nil, errors.New("email already registered")
	}

	// Check if username already exists
	usernameExists, err := s.userRepo.CheckUsernameExists(ctx, req.Username)
	if err != nil {
		return nil, errors.New("failed to check username existence")
	}
	if usernameExists {
		return nil, errors.New("username already taken")
	}

	// ==================================================
	// CREATE USER
	// ==================================================
	
	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password, // Plain text for now (no hashing)
		Role:     "tester",     // Automatically set role to tester
	}

	// Save to database
	err = s.userRepo.CreateUser(ctx, user)
	if err != nil {
		return nil, errors.New("failed to create user")
	}

	// Fetch the created user to get the ID
	createdUser, err := s.userRepo.GetUserByEmail(ctx, user.Email)
	if err != nil {
		return nil, errors.New("failed to retrieve created user")
	}

	return createdUser, nil
}

// CreateGoogleUser creates or retrieves a user authenticated via Google OAuth
// This method handles users signing up/logging in with their Google account
func (s *UserService) CreateGoogleUser(ctx context.Context, name, email, picture string) (*models.User, error) {
	// ==================================================
	// VALIDATION
	// ==================================================
	
	if strings.TrimSpace(email) == "" {
		return nil, errors.New("email is required")
	}
	if strings.TrimSpace(name) == "" {
		return nil, errors.New("name is required")
	}

	// ==================================================
	// CHECK IF USER EXISTS
	// ==================================================
	
	// Check if user with this email already exists
	emailExists, err := s.userRepo.CheckEmailExists(ctx, email)
	if err != nil {
		return nil, errors.New("failed to check email existence")
	}

	// If user exists, return existing user (login scenario)
	if emailExists {
		user, err := s.userRepo.GetUserByEmail(ctx, email)
		if err != nil {
			return nil, errors.New("failed to retrieve existing user")
		}
		return user, nil
	}

	// ==================================================
	// CREATE NEW USER (First time Google signup)
	// ==================================================
	
	user := &models.User{
		Username: name,
		Email:    email,
		Password: "", // No password for Google OAuth users
		Role:     "tester", // Automatically set role to tester
		Picture:  picture, // Store Google profile picture URL
	}

	// Save to database
	err = s.userRepo.CreateUser(ctx, user)
	if err != nil {
		return nil, errors.New("failed to create Google user")
	}

	return user, nil
}

// SetUserPassword updates the password for a user (typically for Google OAuth users)
func (s *UserService) SetUserPassword(ctx context.Context, email, password string) error {
	// ==================================================
	// VALIDATION
	// ==================================================
	
	if strings.TrimSpace(email) == "" {
		return errors.New("email is required")
	}
	if strings.TrimSpace(password) == "" {
		return errors.New("password is required")
	}
	if len(password) < 6 {
		return errors.New("password must be at least 6 characters")
	}

	// ==================================================
	// CHECK IF USER EXISTS
	// ==================================================
	
	emailExists, err := s.userRepo.CheckEmailExists(ctx, email)
	if err != nil {
		return errors.New("failed to check email existence")
	}
	if !emailExists {
		return errors.New("user not found")
	}

	// ==================================================
	// UPDATE PASSWORD
	// ==================================================
	
	err = s.userRepo.UpdateUserPassword(ctx, email, password)
	if err != nil {
		return errors.New("failed to update password")
	}

	return nil
}

// GetUserByEmail retrieves a user by email address
func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	if strings.TrimSpace(email) == "" {
		return nil, errors.New("email is required")
	}

	user, err := s.userRepo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return user, nil
}

// LoginUser validates user credentials and returns user data
func (s *UserService) LoginUser(ctx context.Context, email, password string) (*models.User, error) {
	// ==================================================
	// VALIDATION
	// ==================================================
	
	if strings.TrimSpace(email) == "" {
		return nil, errors.New("email is required")
	}
	if strings.TrimSpace(password) == "" {
		return nil, errors.New("password is required")
	}

	// ==================================================
	// GET USER BY EMAIL
	// ==================================================
	
	user, err := s.userRepo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// ==================================================
	// VERIFY PASSWORD
	// ==================================================
	
	// Plain text comparison (no hashing as requested)
	if user.Password != password {
		return nil, errors.New("invalid email or password")
	}

	return user, nil
}

