package models

import "time"

type Worker struct {
	ID         string    `json:"id" bson:"_id,omitempty"`
	Name       string    `json:"name" bson:"name"`
	Status     string    `json:"status" bson:"status"` // idle, busy, offline
	CurrentJob string    `json:"current_job" bson:"current_job"`
	LastPing   time.Time `json:"last_ping" bson:"last_ping"`
	CreatedAt  time.Time `json:"created_at" bson:"created_at"`
}
