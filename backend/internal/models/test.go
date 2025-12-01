package models

import "time"

type Test struct {
	ID          string    `json:"id" bson:"_id,omitempty"`
	Name        string    `json:"name" bson:"name"`
	Description string    `json:"description" bson:"description"`
	Script      string    `json:"script" bson:"script"`
	UserID      string    `json:"user_id" bson:"user_id"`
	Status      string    `json:"status" bson:"status"` // pending, running, completed
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}
