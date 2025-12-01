package models

import "time"

type User struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	Username  string    `json:"username" bson:"username"`
	Email     string    `json:"email" bson:"email"`
	Password  string    `json:"-" bson:"password"`
	Role      string    `json:"role" bson:"role"` // admin, tester, etc.
	Picture   string    `json:"picture,omitempty" bson:"picture,omitempty"` // Profile picture URL (for Google OAuth)
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time `json:"updated_at" bson:"updated_at"`
}
