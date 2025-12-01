package models

import "time"

type Result struct {
	ID             string    `json:"id" bson:"_id,omitempty"`
	TestID         string    `json:"test_id" bson:"test_id"`
	Status         string    `json:"status" bson:"status"` // success, failed
	VideoPath      string    `json:"video_path" bson:"video_path"`
	ScreenshotPath string    `json:"screenshot_path" bson:"screenshot_path"`
	Logs           string    `json:"logs" bson:"logs"`
	Duration       float64   `json:"duration" bson:"duration"` // in seconds
	CreatedAt      time.Time `json:"created_at" bson:"created_at"`
}
