package services

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
)

// RunnerService handles spawning the Python test runner as a Docker container
type RunnerService struct {
	runnerDir      string
	testScriptsDir string
	pythonPath     string                 // May be empty inside backend container — Docker mode used instead
	runnerImage    string                 // Docker image for the runner container
	dockerNetwork  string                 // Docker network to attach runner container to
	browserMu      map[string]*sync.Mutex // Per-browser mutex for sequential execution
	mu             sync.Mutex             // Protects browserMu map
}

// NewRunnerService creates a new RunnerService
func NewRunnerService() *RunnerService {
	// Find runner directory relative to backend
	runnerDir := os.Getenv("RUNNER_DIR")
	if runnerDir == "" {
		runnerDir = "../runner"
	}

	// Resolve absolute path
	absRunnerDir, err := filepath.Abs(runnerDir)
	if err != nil {
		log.Printf("Warning: Could not resolve runner dir: %v", err)
		absRunnerDir = runnerDir
	}

	// Test scripts directory
	testScriptsDir := os.Getenv("TESTSCRIPTS_DIR")
	if testScriptsDir == "" {
		testScriptsDir = filepath.Join(absRunnerDir, "testscripts")
	}

	// Find Python executable (may not exist in backend container)
	pythonPath := os.Getenv("PYTHON_PATH")
	if pythonPath == "" {
		candidates := []string{"python3", "python"}
		for _, p := range candidates {
			if path, err := exec.LookPath(p); err == nil {
				pythonPath = path
				break
			}
		}
	}

	// Docker runner image name
	runnerImage := os.Getenv("RUNNER_IMAGE")
	if runnerImage == "" {
		runnerImage = "thex_runner:latest"
	}

	// Docker network
	dockerNetwork := os.Getenv("DOCKER_NETWORK")
	if dockerNetwork == "" {
		dockerNetwork = "testops-db-network"
	}

	log.Printf("🐍 Runner service initialized: dir=%s, python=%s", absRunnerDir, pythonPath)
	log.Printf("🐳 Docker runner image: %s, network: %s", runnerImage, dockerNetwork)

	return &RunnerService{
		runnerDir:      absRunnerDir,
		testScriptsDir: testScriptsDir,
		pythonPath:     pythonPath,
		runnerImage:    runnerImage,
		dockerNetwork:  dockerNetwork,
		browserMu:      make(map[string]*sync.Mutex),
	}
}

// getBrowserMutex returns a per-browser mutex, creating one if needed
func (s *RunnerService) getBrowserMutex(browser string) *sync.Mutex {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.browserMu[browser]; !ok {
		s.browserMu[browser] = &sync.Mutex{}
	}
	return s.browserMu[browser]
}

// ExecuteTestRunSync spawns the Python runner and waits for it to complete (blocking).
// Used when same-browser tests must run sequentially.
func (s *RunnerService) ExecuteTestRunSync(params RunParams) error {
	if s.pythonPath == "" {
		return fmt.Errorf("python executable not found")
	}

	runnerScript := filepath.Join(s.runnerDir, "src", "runner.py")
	if _, err := os.Stat(runnerScript); os.IsNotExist(err) {
		return fmt.Errorf("runner script not found: %s", runnerScript)
	}

	args := []string{
		runnerScript,
		"--email", params.Email,
		"--username", params.Username,
		"--test-id", params.RunID,
		"--backend-url", params.BackendURL,
	}
	if params.UserID != "" {
		args = append(args, "--user-id", params.UserID)
	}
	if params.TestFile != "" {
		args = append(args, "--file", params.TestFile)
	}
	if params.Browser != "" {
		args = append(args, "--browser", params.Browser)
	}

	cmd := exec.Command(s.pythonPath, args...)
	cmd.Dir = s.runnerDir

	env := os.Environ()
	seleniumHubURL := os.Getenv("SELENIUM_HUB_URL")
	if seleniumHubURL == "" {
		seleniumHubURL = "http://localhost:4444"
	}
	env = append(env,
		fmt.Sprintf("SELENIUM_HUB_URL=%s", seleniumHubURL),
		"MONGO_HOST=localhost",
		"MONGO_PORT=27017",
		"MONGO_USERNAME=admin",
		"MONGO_PASSWORD=admin123",
		"MONGO_DATABASE=testops",
		"PYTHONUNBUFFERED=1",
		fmt.Sprintf("RUNNER_BASE_DIR=%s", s.runnerDir),
		fmt.Sprintf("TESTSCRIPTS_DIR=%s", s.testScriptsDir),
		fmt.Sprintf("OUTPUT_DIR=%s", filepath.Join(s.runnerDir, "output")),
	)
	cmd.Env = env

	testBaseName := strings.TrimSuffix(params.TestFile, filepath.Ext(params.TestFile))
	logFile := filepath.Join(s.runnerDir, "logs", fmt.Sprintf("run_%s_%s_%s.log", params.RunID, testBaseName, params.Browser))
	os.MkdirAll(filepath.Dir(logFile), 0755)

	outFile, err := os.Create(logFile)
	if err != nil {
		log.Printf("Warning: Could not create log file %s: %v", logFile, err)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
	} else {
		defer outFile.Close()
		cmd.Stdout = outFile
		cmd.Stderr = outFile
	}

	log.Printf("🚀 Running (sync): %s on %s", params.TestFile, params.Browser)

	if err := cmd.Run(); err != nil {
		log.Printf("⚠️ Runner for %s on %s exited with error: %v", params.TestFile, params.Browser, err)
		return err
	}

	log.Printf("✅ Runner completed: %s on %s", params.TestFile, params.Browser)
	return nil
}

// ExecuteTestRunsForBrowser runs a list of tests sequentially on one browser.
// This is launched as a goroutine so different browsers execute in parallel.
func (s *RunnerService) ExecuteTestRunsForBrowser(browser string, paramsList []RunParams) {
	bmu := s.getBrowserMutex(browser)
	bmu.Lock()
	defer bmu.Unlock()

	log.Printf("🔒 Starting sequential execution for browser: %s (%d tests)", browser, len(paramsList))
	for _, params := range paramsList {
		if err := s.ExecuteTestRunSync(params); err != nil {
			log.Printf("⚠️ Test %s failed on %s: %v", params.TestFile, browser, err)
		}
	}
	log.Printf("🔓 Completed all tests for browser: %s", browser)
}

// ExecuteTestRun spawns the Python runner to execute a test run
func (s *RunnerService) ExecuteTestRun(params RunParams) error {
	if s.pythonPath == "" {
		return fmt.Errorf("python executable not found")
	}

	runnerScript := filepath.Join(s.runnerDir, "src", "runner.py")
	if _, err := os.Stat(runnerScript); os.IsNotExist(err) {
		return fmt.Errorf("runner script not found: %s", runnerScript)
	}

	// Build command arguments
	args := []string{
		runnerScript,
		"--email", params.Email,
		"--username", params.Username,
		"--test-id", params.RunID,
		"--backend-url", params.BackendURL,
	}

	if params.UserID != "" {
		args = append(args, "--user-id", params.UserID)
	}

	if params.TestFile != "" {
		args = append(args, "--file", params.TestFile)
	}

	if params.Browser != "" {
		args = append(args, "--browser", params.Browser)
	}

	cmd := exec.Command(s.pythonPath, args...)
	cmd.Dir = s.runnerDir

	// Set environment variables for Selenium Grid Hub
	env := os.Environ()
	seleniumHubURL := os.Getenv("SELENIUM_HUB_URL")
	if seleniumHubURL == "" {
		seleniumHubURL = "http://localhost:4444"
	}
	env = append(env,
		fmt.Sprintf("SELENIUM_HUB_URL=%s", seleniumHubURL),
		"MONGO_HOST=localhost",
		"MONGO_PORT=27017",
		"MONGO_USERNAME=admin",
		"MONGO_PASSWORD=admin123",
		"MONGO_DATABASE=testops",
		"PYTHONUNBUFFERED=1",
		fmt.Sprintf("RUNNER_BASE_DIR=%s", s.runnerDir),
		fmt.Sprintf("TESTSCRIPTS_DIR=%s", s.testScriptsDir),
		fmt.Sprintf("OUTPUT_DIR=%s", filepath.Join(s.runnerDir, "output")),
	)
	cmd.Env = env

	// Log stdout/stderr — include browser and test file for unique names when parallel runners share the same RunID
	testBaseName := strings.TrimSuffix(params.TestFile, filepath.Ext(params.TestFile))
	logFile := filepath.Join(s.runnerDir, "logs", fmt.Sprintf("run_%s_%s_%s.log", params.RunID, testBaseName, params.Browser))
	os.MkdirAll(filepath.Dir(logFile), 0755)

	outFile, err := os.Create(logFile)
	if err != nil {
		log.Printf("Warning: Could not create log file %s: %v", logFile, err)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
	} else {
		cmd.Stdout = outFile
		cmd.Stderr = outFile
	}

	log.Printf("🚀 Spawning runner: %s %s", s.pythonPath, strings.Join(args, " "))
	log.Printf("📁 Working dir: %s", s.runnerDir)
	log.Printf("📝 Log file: %s", logFile)

	// Start the process in the background
	if err := cmd.Start(); err != nil {
		if outFile != nil {
			outFile.Close()
		}
		return fmt.Errorf("failed to start runner: %v", err)
	}

	// Monitor in a goroutine
	go func() {
		defer func() {
			if outFile != nil {
				outFile.Close()
			}
		}()

		err := cmd.Wait()
		if err != nil {
			log.Printf("⚠️ Runner process for run %s exited with error: %v", params.RunID, err)
		} else {
			log.Printf("✅ Runner process for run %s completed successfully", params.RunID)
		}
	}()

	log.Printf("✅ Runner process spawned with PID %d for run %s", cmd.Process.Pid, params.RunID)
	return nil
}

// ExecuteTestRunParallel spawns a runner Docker container with --files, --browsers, --parallel.
// This leverages Selenium Grid's parallel node execution.
// The runner container connects to the same Docker network as Selenium Hub and MongoDB.
func (s *RunnerService) ExecuteTestRunParallel(params RunParams) error {
	// Check if docker CLI is available
	dockerPath, err := exec.LookPath("docker")
	if err != nil {
		return fmt.Errorf("docker CLI not found: %v", err)
	}

	// Build runner arguments
	runnerArgs := []string{
		"--email", params.Email,
		"--username", params.Username,
		"--test-id", params.RunID,
		"--backend-url", params.BackendURL,
	}
	if params.UserID != "" {
		runnerArgs = append(runnerArgs, "--user-id", params.UserID)
	}

	// Multiple files → --files file1.py,file2.py
	if len(params.TestFiles) > 0 {
		runnerArgs = append(runnerArgs, "--files", strings.Join(params.TestFiles, ","))
	} else if params.TestFile != "" {
		runnerArgs = append(runnerArgs, "--file", params.TestFile)
	}

	// Multiple browsers → --browsers chrome,firefox
	if len(params.Browsers) > 0 {
		runnerArgs = append(runnerArgs, "--browsers", strings.Join(params.Browsers, ","))
	} else if params.Browser != "" {
		runnerArgs = append(runnerArgs, "--browser", params.Browser)
	}

	// Parallel workers
	parallel := params.Parallel
	if parallel <= 0 {
		nFiles := len(params.TestFiles)
		if nFiles == 0 && params.TestFile != "" {
			nFiles = 1
		}
		nBrowsers := len(params.Browsers)
		if nBrowsers == 0 && params.Browser != "" {
			nBrowsers = 1
		}
		parallel = nFiles * nBrowsers
		if parallel < 1 {
			parallel = 1
		}
	}
	runnerArgs = append(runnerArgs, "--parallel", fmt.Sprintf("%d", parallel))

	// Build unique container name
	browserLabel := "multi"
	if len(params.Browsers) > 0 {
		browserLabel = strings.Join(params.Browsers, "-")
	}
	containerName := fmt.Sprintf("testops-runner-%s-%s", params.RunID, browserLabel)
	// Docker container names can't have certain chars
	containerName = strings.ReplaceAll(containerName, " ", "-")

	// Selenium Hub URL (within Docker network)
	seleniumHubURL := os.Getenv("SELENIUM_HUB_URL")
	if seleniumHubURL == "" {
		seleniumHubURL = "http://selenium-hub:4444"
	}

	// MongoDB connection details (within Docker network)
	mongoHost := os.Getenv("MONGO_HOST")
	if mongoHost == "" {
		mongoHost = "testops-mongo"
	}
	mongoPort := os.Getenv("MONGO_PORT")
	if mongoPort == "" {
		mongoPort = "27017"
	}
	mongoUser := os.Getenv("MONGO_USERNAME")
	if mongoUser == "" {
		mongoUser = "admin"
	}
	mongoPass := os.Getenv("MONGO_PASSWORD")
	if mongoPass == "" {
		mongoPass = "admin123"
	}
	mongoDb := os.Getenv("MONGO_DATABASE")
	if mongoDb == "" {
		mongoDb = "testops"
	}

	// Determine host-side project path for volume mounts.
	// We need the HOST path so that `docker run -v` maps correctly.
	// The runner needs:
	//   1. testscripts dir — shared test files uploaded by the user
	//   2. videos dir — shared with Selenium Grid nodes (ffmpeg writes here)
	hostProjectPath := os.Getenv("HOST_PROJECT_PATH")
	if hostProjectPath == "" {
		// Fallback: try to resolve from /app/project mount
		if _, err := os.Stat("/app/project/runner/testscripts"); err == nil {
			// We're in Docker but HOST_PROJECT_PATH not set.
			// Use docker inspect to find the host path of /app/project
			inspectCmd := exec.Command("docker", "inspect", "--format", "{{range .Mounts}}{{if eq .Destination \"/app/project\"}}{{.Source}}{{end}}{{end}}", "testops-backend-api")
			if output, err := inspectCmd.Output(); err == nil {
				hostProjectPath = strings.TrimSpace(string(output))
			}
		}
	}

	hostTestScriptsPath := ""
	hostVideosPath := ""
	if hostProjectPath != "" {
		hostTestScriptsPath = hostProjectPath + "/runner/testscripts"
		hostVideosPath = hostProjectPath + "/runner/output/videos"
	} else {
		// Last fallback: use container path (works if running natively)
		hostTestScriptsPath = s.testScriptsDir
		hostVideosPath = filepath.Join(s.runnerDir, "output", "videos")
	}

	// Build docker create command (create container without starting it)
	// This allows us to connect to BOTH networks BEFORE the runner process starts.
	seleniumNetwork := "thex_testops-network"

	createArgs := []string{
		"create", "--rm",
		"--name", containerName,
		"--network", s.dockerNetwork,
		// Environment variables
		"-e", fmt.Sprintf("SELENIUM_HUB_URL=%s", seleniumHubURL),
		"-e", fmt.Sprintf("MONGO_HOST=%s", mongoHost),
		"-e", fmt.Sprintf("MONGO_PORT=%s", mongoPort),
		"-e", fmt.Sprintf("MONGO_USERNAME=%s", mongoUser),
		"-e", fmt.Sprintf("MONGO_PASSWORD=%s", mongoPass),
		"-e", fmt.Sprintf("MONGO_DATABASE=%s", mongoDb),
		"-e", "PYTHONUNBUFFERED=1",
		// Mount shared testscripts volume (host path → container /app/testscripts)
		"-v", fmt.Sprintf("%s:/app/testscripts", hostTestScriptsPath),
		// Mount shared videos volume — same dir that Selenium Grid nodes write to via ffmpeg
		// Chrome/Firefox nodes mount host:runner/output/videos → /videos (ffmpeg writes here)
		// Runner needs it at /app/output/videos to read the file and upload to GridFS
		"-v", fmt.Sprintf("%s:/app/output/videos", hostVideosPath),
		// Mount docker socket for video recording (docker exec into grid nodes)
		"-v", "/var/run/docker.sock:/var/run/docker.sock",
		// Shared memory for browsers
		"--shm-size", "2g",
		// Image
		s.runnerImage,
		// Command: python src/runner.py <args>
		"python", "src/runner.py",
	}
	createArgs = append(createArgs, runnerArgs...)

	// Log file for the runner output
	logFile := filepath.Join(s.runnerDir, "logs", fmt.Sprintf("run_%s_%s.log", params.RunID, browserLabel))
	os.MkdirAll(filepath.Dir(logFile), 0755)

	log.Printf("🐳 Creating runner container: docker %s", strings.Join(createArgs, " "))
	log.Printf("📝 Log file: %s", logFile)
	log.Printf("🔀 Parallel workers: %d", parallel)

	// Step 1: docker create (creates the container without starting it)
	createCmd := exec.Command(dockerPath, createArgs...)
	createOut, err := createCmd.CombinedOutput()
	containerID := strings.TrimSpace(string(createOut))
	if err != nil {
		return fmt.Errorf("failed to create runner container: %v (%s)", err, containerID)
	}
	log.Printf("✅ Runner container created: %s (ID: %s)", containerName, containerID[:12])

	// Step 2: Connect to the Selenium Grid network BEFORE starting
	connectCmd := exec.Command(dockerPath, "network", "connect", seleniumNetwork, containerName)
	if out, err := connectCmd.CombinedOutput(); err != nil {
		// Clean up the created container since it can't reach Selenium
		exec.Command(dockerPath, "rm", "-f", containerName).Run()
		return fmt.Errorf("failed to connect runner to %s: %v (%s)", seleniumNetwork, err, string(out))
	}
	log.Printf("✅ Runner connected to network: %s (before start)", seleniumNetwork)

	// Step 3: docker start the container
	startCmd := exec.Command(dockerPath, "start", containerName)
	if out, err := startCmd.CombinedOutput(); err != nil {
		exec.Command(dockerPath, "rm", "-f", containerName).Run()
		return fmt.Errorf("failed to start runner container: %v (%s)", err, string(out))
	}
	log.Printf("✅ Runner container started: %s", containerName)

	// Step 4: Stream logs in a background goroutine so we capture actual runner output
	go func() {
		outFile, err := os.Create(logFile)
		if err != nil {
			log.Printf("Warning: Could not create log file %s: %v", logFile, err)
			return
		}
		defer outFile.Close()

		// docker logs -f will follow until the container exits
		logsCmd := exec.Command(dockerPath, "logs", "-f", containerName)
		logsCmd.Stdout = outFile
		logsCmd.Stderr = outFile
		if err := logsCmd.Run(); err != nil {
			log.Printf("⚠️ docker logs for run %s ended: %v", params.RunID, err)
		}
		log.Printf("✅ Runner container for run %s completed, logs saved to %s", params.RunID, logFile)
	}()

	log.Printf("✅ Runner container spawned: %s", containerName)
	return nil
}

// GetRunnerDir returns the runner directory path
func (s *RunnerService) GetRunnerDir() string {
	return s.runnerDir
}

// GetTestScriptsDir returns the testscripts directory path
func (s *RunnerService) GetTestScriptsDir() string {
	return s.testScriptsDir
}

// GetPlatformInfo returns OS info for debugging
func (s *RunnerService) GetPlatformInfo() string {
	return fmt.Sprintf("OS=%s ARCH=%s", runtime.GOOS, runtime.GOARCH)
}

// RunParams holds parameters for a test run execution
type RunParams struct {
	RunID      string
	Email      string
	Username   string
	UserID     string
	BackendURL string
	TestFile   string   // Optional: specific test file to run (single — legacy)
	Browser    string   // Single browser for this execution (legacy)
	TestFiles  []string // Multiple test files (comma-joined for --files)
	Browsers   []string // Multiple browsers (comma-joined for --browsers)
	Parallel   int      // Number of parallel workers (0 or 1 = sequential)
}
