package handlers

import (
	"encoding/json"
	"net/http"
)

type WorkersHandler struct {
	// TODO: Add service dependencies
}

func NewWorkersHandler() *WorkersHandler {
	return &WorkersHandler{}
}

func (h *WorkersHandler) GetWorkers(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement get workers logic
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "get workers endpoint"})
}

func (h *WorkersHandler) GetWorkerStatus(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement get worker status logic
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "get worker status endpoint"})
}
