package handlers

import (
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/services"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TestRunHandler struct {
	testSuiteRepo  *repository.TestSuiteRepository
	testCaseRepo   *repository.TestCaseRepository
	testRunRepo    *repository.TestRunRepository
	testResultRepo *repository.TestResultRepository
	screenshotRepo *repository.ScreenshotRepository
	videoRepo      *repository.VideoRepository
	logRepo        *repository.LogRepository
	runnerService  *services.RunnerService
}

func NewTestRunHandler(
	testSuiteRepo *repository.TestSuiteRepository,
	testCaseRepo *repository.TestCaseRepository,
	testRunRepo *repository.TestRunRepository,
	testResultRepo *repository.TestResultRepository,
	screenshotRepo *repository.ScreenshotRepository,
	videoRepo *repository.VideoRepository,
	logRepo *repository.LogRepository,
	runnerService *services.RunnerService,
) *TestRunHandler {
	return &TestRunHandler{
		testSuiteRepo:  testSuiteRepo,
		testCaseRepo:   testCaseRepo,
		testRunRepo:    testRunRepo,
		testResultRepo: testResultRepo,
		screenshotRepo: screenshotRepo,
		videoRepo:      videoRepo,
		logRepo:        logRepo,
		runnerService:  runnerService,
	}
}

// TriggerRun starts a new test run for a suite
func (h *TestRunHandler) TriggerRun(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Email == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	suiteIDStr := vars["suite_id"]
	suiteID, err := primitive.ObjectIDFromHex(suiteIDStr)
	if err != nil {
		http.Error(w, "Invalid suite ID", http.StatusBadRequest)
		return
	}

	// Verify suite exists and belongs to user
	suite, err := h.testSuiteRepo.GetByID(r.Context(), suiteID)
	if err != nil {
		http.Error(w, "Test suite not found", http.StatusNotFound)
		return
	}
	if suite.CreatedBy != claims.Email {
		http.Error(w, "Unauthorized access to this suite", http.StatusForbidden)
		return
	}

	var req struct {
		Browsers []string `json:"browsers"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// Use default browser if no body
		req.Browsers = []string{suite.DefaultBrowser}
	}

	if len(req.Browsers) == 0 {
		req.Browsers = []string{suite.DefaultBrowser}
	}

	// Get test cases count
	testCases, err := h.testCaseRepo.GetActiveBySuiteID(r.Context(), suiteID)
	if err != nil {
		http.Error(w, "Failed to fetch test cases", http.StatusInternalServerError)
		return
	}
	if len(testCases) == 0 {
		http.Error(w, "No active test cases in this suite", http.StatusBadRequest)
		return
	}

	// Generate run ID
	runID := time.Now().Format("20060102_150405")

	// Create test run
	testRun := models.TestRun{
		RunID:       runID,
		SuiteID:     suiteID,
		SuiteName:   suite.SuiteName,
		TriggeredBy: claims.Email,
		Browsers:    req.Browsers,
		Status:      "pending",
		TotalTests:  len(testCases) * len(req.Browsers), // Each test runs on each browser
		Passed:      0,
		Failed:      0,
		SuccessRate: 0,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.testRunRepo.Create(r.Context(), &testRun); err != nil {
		http.Error(w, fmt.Sprintf("Failed to create test run: %v", err), http.StatusInternalServerError)
		return
	}

	// Create initial TestResult entries for each test case and browser combination
	for _, tc := range testCases {
		for _, browser := range req.Browsers {
			result := models.TestResult{
				RunID:       testRun.ID,
				RunIDString: runID,
				TestCaseID:  tc.ID,
				TestName:    tc.TestName,
				Browser:     browser,
				Status:      "pending",
				CreatedAt:   time.Now(),
			}
			h.testResultRepo.Create(r.Context(), &result)
		}
	}

	// TODO: Push to Redis queue for runner to pick up
	// For now, return the created run

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Test run triggered successfully",
		"run":     testRun,
	})
}

// GetUserRuns retrieves all test runs for the authenticated user
func (h *TestRunHandler) GetUserRuns(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Email == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	runs, err := h.testRunRepo.GetUserRuns(r.Context(), claims.Email)
	if err != nil {
		http.Error(w, "Failed to fetch test runs", http.StatusInternalServerError)
		return
	}

	if runs == nil {
		runs = []models.TestRun{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(runs)
}

// GetSuiteRuns retrieves all runs for a specific suite
func (h *TestRunHandler) GetSuiteRuns(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Email == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	suiteIDStr := vars["suite_id"]
	suiteID, err := primitive.ObjectIDFromHex(suiteIDStr)
	if err != nil {
		http.Error(w, "Invalid suite ID", http.StatusBadRequest)
		return
	}

	// Verify suite belongs to user
	suite, err := h.testSuiteRepo.GetByID(r.Context(), suiteID)
	if err != nil {
		http.Error(w, "Test suite not found", http.StatusNotFound)
		return
	}
	if suite.CreatedBy != claims.Email {
		http.Error(w, "Unauthorized access to this suite", http.StatusForbidden)
		return
	}

	runs, err := h.testRunRepo.GetBySuiteID(r.Context(), suiteID)
	if err != nil {
		http.Error(w, "Failed to fetch runs", http.StatusInternalServerError)
		return
	}

	if runs == nil {
		runs = []models.TestRun{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(runs)
}

// GetRunDetails retrieves details of a specific run including all results and artifacts
func (h *TestRunHandler) GetRunDetails(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Email == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	runIDStr := vars["run_id"]

	// Try to find run by ObjectID first, then by human-readable run_id
	var run *models.TestRun
	var err error

	runOID, oidErr := primitive.ObjectIDFromHex(runIDStr)
	if oidErr == nil {
		run, err = h.testRunRepo.GetByID(r.Context(), runOID)
	}
	if run == nil {
		run, err = h.testRunRepo.GetByRunID(r.Context(), runIDStr)
	}

	if err != nil || run == nil {
		http.Error(w, "Test run not found", http.StatusNotFound)
		return
	}

	// Verify ownership
	if run.TriggeredBy != claims.Email {
		http.Error(w, "Unauthorized access to this run", http.StatusForbidden)
		return
	}

	// Get results
	results, err := h.testResultRepo.GetByRunID(r.Context(), run.ID)
	if err != nil {
		results = []models.TestResult{}
	}

	// Get screenshots
	screenshots, err := h.screenshotRepo.GetByRunID(r.Context(), run.ID)
	if err != nil {
		screenshots = []models.Screenshot{}
	}

	// Get videos
	videos, err := h.videoRepo.GetByRunID(r.Context(), run.ID)
	if err != nil {
		videos = []models.Video{}
	}

	// Get logs
	logs, err := h.logRepo.GetByRunID(r.Context(), run.ID)
	if err != nil {
		logs = []models.Log{}
	}

	// Convert screenshots to response format
	var screenshotResponses []models.ScreenshotResponse
	for _, s := range screenshots {
		screenshotResponses = append(screenshotResponses, models.ScreenshotResponse{
			ID:        s.ID.Hex(),
			Name:      s.Name,
			TestName:  s.TestName,
			Browser:   s.Browser,
			Timestamp: s.CreatedAt.Format("3:04:05 PM"),
			URL:       fmt.Sprintf("/api/screenshots/%s", s.ID.Hex()),
			Step:      s.Step,
			SizeBytes: s.SizeBytes,
		})
	}

	// Convert videos to response format
	var videoResponses []models.VideoResponse
	for _, v := range videos {
		duration := fmt.Sprintf("%.0fs", v.DurationSeconds)
		size := fmt.Sprintf("%.2f MB", float64(v.SizeBytes)/(1024*1024))
		videoResponses = append(videoResponses, models.VideoResponse{
			ID:              v.ID.Hex(),
			Name:            v.Name,
			TestName:        v.TestName,
			Browser:         v.Browser,
			Duration:        duration,
			DurationSeconds: v.DurationSeconds,
			Size:            size,
			SizeBytes:       v.SizeBytes,
			URL:             fmt.Sprintf("/api/videos/%s", v.ID.Hex()),
		})
	}

	// Convert logs to response format
	var logResponses []models.LogResponse
	for _, l := range logs {
		logResponses = append(logResponses, models.LogResponse{
			Timestamp: l.CreatedAt.Format("3:04:05 PM"),
			Level:     l.Level,
			Message:   l.Message,
			TestName:  l.TestName,
			Browser:   l.Browser,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"run":         run,
		"status":      run.Status,
		"results":     results,
		"screenshots": screenshotResponses,
		"videos":      videoResponses,
		"logs":        logResponses,
	})
}

// GetResultDetails retrieves details for a specific test result including its artifacts
func (h *TestRunHandler) GetResultDetails(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Email == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	resultIDStr := vars["result_id"]
	resultID, err := primitive.ObjectIDFromHex(resultIDStr)
	if err != nil {
		http.Error(w, "Invalid result ID", http.StatusBadRequest)
		return
	}

	result, err := h.testResultRepo.GetByID(r.Context(), resultID)
	if err != nil {
		http.Error(w, "Test result not found", http.StatusNotFound)
		return
	}

	// Verify ownership via run
	run, err := h.testRunRepo.GetByID(r.Context(), result.RunID)
	if err != nil || run.TriggeredBy != claims.Email {
		http.Error(w, "Unauthorized access to this result", http.StatusForbidden)
		return
	}

	// Get artifacts for this specific result
	screenshots, _ := h.screenshotRepo.GetByResultID(r.Context(), resultID)
	videos, _ := h.videoRepo.GetByResultID(r.Context(), resultID)
	logs, _ := h.logRepo.GetByResultID(r.Context(), resultID)

	// Convert to response formats
	var screenshotResponses []models.ScreenshotResponse
	for _, s := range screenshots {
		screenshotResponses = append(screenshotResponses, models.ScreenshotResponse{
			ID:        s.ID.Hex(),
			Name:      s.Name,
			TestName:  s.TestName,
			Browser:   s.Browser,
			Timestamp: s.CreatedAt.Format("3:04:05 PM"),
			URL:       fmt.Sprintf("/api/screenshots/%s", s.ID.Hex()),
			Step:      s.Step,
			SizeBytes: s.SizeBytes,
		})
	}

	var videoResponses []models.VideoResponse
	for _, v := range videos {
		duration := fmt.Sprintf("%.0fs", v.DurationSeconds)
		size := fmt.Sprintf("%.2f MB", float64(v.SizeBytes)/(1024*1024))
		videoResponses = append(videoResponses, models.VideoResponse{
			ID:              v.ID.Hex(),
			Name:            v.Name,
			TestName:        v.TestName,
			Browser:         v.Browser,
			Duration:        duration,
			DurationSeconds: v.DurationSeconds,
			Size:            size,
			SizeBytes:       v.SizeBytes,
			URL:             fmt.Sprintf("/api/videos/%s", v.ID.Hex()),
		})
	}

	var logResponses []models.LogResponse
	for _, l := range logs {
		logResponses = append(logResponses, models.LogResponse{
			Timestamp: l.CreatedAt.Format("3:04:05 PM"),
			Level:     l.Level,
			Message:   l.Message,
			TestName:  l.TestName,
			Browser:   l.Browser,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"result":      result,
		"screenshots": screenshotResponses,
		"videos":      videoResponses,
		"logs":        logResponses,
	})
}

// CreateAndRunSuite creates a new test suite, uploads test files, and triggers a run
// This is a combined endpoint for the frontend to use in one request
func (h *TestRunHandler) CreateAndRunSuite(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Email == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse multipart form (max 32MB)
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse form: %v", err), http.StatusBadRequest)
		return
	}

	// Get form values
	suiteName := r.FormValue("suite_name")
	browsersJSON := r.FormValue("browsers")
	username := r.FormValue("username")
	email := r.FormValue("email")
	userID := r.FormValue("user_id")

	if suiteName == "" {
		http.Error(w, "Suite name is required", http.StatusBadRequest)
		return
	}

	// Parse browsers JSON array
	var browsers []string
	if err := json.Unmarshal([]byte(browsersJSON), &browsers); err != nil {
		browsers = []string{"chrome"} // Default to chrome
	}
	if len(browsers) == 0 {
		browsers = []string{"chrome"}
	}

	// Create the test suite
	suite := models.TestSuite{
		SuiteName:      suiteName,
		Description:    fmt.Sprintf("Created by %s via test execution", username),
		CreatedBy:      claims.Email,
		Tags:           []string{},
		DefaultBrowser: browsers[0],
		Framework:      "selenium",
		IsDeleted:      false,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := h.testSuiteRepo.Create(r.Context(), &suite); err != nil {
		http.Error(w, fmt.Sprintf("Failed to create test suite: %v", err), http.StatusInternalServerError)
		return
	}

	// Get uploaded test files
	files := r.MultipartForm.File["test_files"]
	if len(files) == 0 {
		http.Error(w, "No test files uploaded", http.StatusBadRequest)
		return
	}

	// Determine testscripts directory
	testScriptsDir := os.Getenv("TESTSCRIPTS_DIR")
	if testScriptsDir == "" {
		// Default to relative path from backend
		testScriptsDir = "../runner/testscripts"
	}

	// Create test cases for each uploaded file
	var testCases []models.TestCase
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to open uploaded file: %v", err), http.StatusInternalServerError)
			return
		}
		defer file.Close()

		// Generate unique filename to avoid conflicts
		originalName := fileHeader.Filename
		ext := filepath.Ext(originalName)
		baseName := strings.TrimSuffix(originalName, ext)
		timestamp := time.Now().Format("20060102_150405")
		uniqueName := fmt.Sprintf("%s_%s%s", baseName, timestamp, ext)

		// Save file to testscripts directory
		destPath := filepath.Join(testScriptsDir, uniqueName)
		destFile, err := os.Create(destPath)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to save test file: %v", err), http.StatusInternalServerError)
			return
		}
		defer destFile.Close()

		if _, err := io.Copy(destFile, file); err != nil {
			http.Error(w, fmt.Sprintf("Failed to write test file: %v", err), http.StatusInternalServerError)
			return
		}

		// Determine language from extension
		language := "python"
		if strings.HasSuffix(originalName, ".js") {
			language = "javascript"
		} else if strings.HasSuffix(originalName, ".java") {
			language = "java"
		}

		// Create test case entry
		testCase := models.TestCase{
			SuiteID:          suite.ID,
			TestName:         baseName,
			OriginalFilename: uniqueName,
			Language:         language,
			Framework:        "selenium",
			Priority:         "medium",
			IsActive:         true,
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		}

		if err := h.testCaseRepo.Create(r.Context(), &testCase); err != nil {
			http.Error(w, fmt.Sprintf("Failed to create test case: %v", err), http.StatusInternalServerError)
			return
		}

		testCases = append(testCases, testCase)
	}

	// Generate run ID
	runID := time.Now().Format("20060102_150405")

	// Create test run
	testRun := models.TestRun{
		RunID:       runID,
		SuiteID:     suite.ID,
		SuiteName:   suite.SuiteName,
		TriggeredBy: claims.Email,
		Browsers:    browsers,
		Status:      "pending",
		TotalTests:  len(testCases) * len(browsers), // Expected total — runners check this to know when all are done
		Passed:      0,
		Failed:      0,
		SuccessRate: 0,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.testRunRepo.Create(r.Context(), &testRun); err != nil {
		http.Error(w, fmt.Sprintf("Failed to create test run: %v", err), http.StatusInternalServerError)
		return
	}

	// Create initial TestResult entries for each test case and browser combination
	// Use the timestamped filename (without extension) as TestName so the runner can match and update it
	for _, tc := range testCases {
		resultTestName := strings.TrimSuffix(tc.OriginalFilename, filepath.Ext(tc.OriginalFilename))
		for _, browser := range browsers {
			result := models.TestResult{
				RunID:       testRun.ID,
				RunIDString: runID,
				TestCaseID:  tc.ID,
				TestName:    resultTestName,
				Browser:     browser,
				Status:      "pending",
				CreatedAt:   time.Now(),
			}
			h.testResultRepo.Create(r.Context(), &result)
		}
	}

	// Parse parallel count from form (optional, defaults to auto-calculate)
	parallelStr := r.FormValue("parallel")
	parallelCount := 0 // 0 = auto-calculate (files × browsers)
	if parallelStr != "" {
		fmt.Sscanf(parallelStr, "%d", &parallelCount)
	}

	// Log request details for debugging
	fmt.Printf("CreateAndRunSuite: user=%s, email=%s, userID=%s, suite=%s, browsers=%v, files=%d, parallel=%d\n",
		username, email, userID, suiteName, browsers, len(files), parallelCount)

	// Spawn a SINGLE runner container with --files, --browsers, --parallel.
	// The runner handles all parallelism internally via ThreadPoolExecutor + Selenium Grid.
	if h.runnerService != nil {
		backendURL := os.Getenv("BACKEND_INTERNAL_URL")
		if backendURL == "" {
			backendURL = fmt.Sprintf("http://testops-backend-api:%s/api", os.Getenv("PORT"))
			if backendURL == "http://testops-backend-api:/api" {
				backendURL = "http://testops-backend-api:8080/api"
			}
		}

		// Collect all test file names
		var testFileNames []string
		for _, tc := range testCases {
			testFileNames = append(testFileNames, tc.OriginalFilename)
		}

		params := services.RunParams{
			RunID:      runID,
			Email:      claims.Email,
			Username:   username,
			UserID:     userID,
			BackendURL: backendURL,
			TestFiles:  testFileNames,
			Browsers:   browsers,
			Parallel:   parallelCount,
		}

		if err := h.runnerService.ExecuteTestRunParallel(params); err != nil {
			log.Printf("⚠️ Failed to spawn runner: %v", err)
			http.Error(w, fmt.Sprintf("Failed to start test runner: %v", err), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"message":  "Test run triggered successfully",
		"suite_id": suite.ID.Hex(),
		"run_id":   testRun.ID.Hex(),
		"run":      testRun,
	})
}
