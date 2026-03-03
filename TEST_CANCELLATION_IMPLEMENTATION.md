![alt text](image.png)# Test Execution Cancellation & Management Implementation Guide

## 📋 Overview

This document outlines the complete implementation for handling test execution cancellation, timeouts, and error scenarios.

## 🎯 Scenarios Covered

### ✅ Implemented Files
1. `backend/internal/handlers/execution_tracker.go` - Track running executions
2. `backend/internal/handlers/cancel_handler.go` - Handle cancellations

### 🔄 Files to Update
3. `backend/internal/handlers/runner_handler.go` - Async execution with tracking
4. `backend/cmd/api/main.go` - Register new routes
5. `Frontend/src/pages/admin-history.tsx` - Add cancel button
6. `Frontend/src/pages/reports.tsx` - Add cancel button
7. `Frontend/src/lib/apiConfig.ts` - Add cancel endpoint

---

## 🚨 Critical Scenarios & Solutions

### **Scenario 1: User Cancels During Execution**

#### Backend Changes Required:

**File: `backend/internal/handlers/runner_handler.go`**

```go
type RunnerHandler struct {
	testSuiteRepo *repository.TestSuiteRepository
	tracker       *ExecutionTracker  // ADD THIS
}

func NewRunnerHandler(testSuiteRepo *repository.TestSuiteRepository) *RunnerHandler {
	return &RunnerHandler{
		testSuiteRepo: testSuiteRepo,
		tracker:       NewExecutionTracker(),  // ADD THIS
	}
}
```

**Update RunTestSuite function to run asynchronously:**

```go
func (h *RunnerHandler) RunTestSuite(w http.ResponseWriter, r *http.Request) {
	// ... existing code for parsing request ...
	
	// Generate suite ID
	suiteID := fmt.Sprintf("%s_%d", time.Now().Format("20060102_150405"), time.Now().Unix()%1000)
	
	// Create test suite in database with "running" status
	// ... existing database save code ...
	
	// Create context with timeout (30 minutes max)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
	
	// Build docker command
	cmd := exec.CommandContext(ctx,
		"docker",
		"run",
		"--name", fmt.Sprintf("runner_%s", suiteID),  // Named container for tracking
		"--network", "thex_testops-network",
		"-v", "/var/run/docker.sock:/var/run/docker.sock",
		"-v", fmt.Sprintf("%s/runner/testscripts:/app/testscripts", hostProjectRoot),
		"-v", fmt.Sprintf("%s/runner/output:/app/output", hostProjectRoot),
		"-v", fmt.Sprintf("%s/runner/logs:/app/logs", hostProjectRoot),
		"-e", "PYTHONUNBUFFERED=1",
		"-e", "DISPLAY=:99",
		"-e", "MONGO_HOST=testops-mongo",
		"-e", "MONGO_PORT=27017",
		"-e", "MONGO_DATABASE=testops",
		"-e", "MONGO_USERNAME=admin",
		"-e", "MONGO_PASSWORD=admin123",
		"thex_runner:latest",
		"python",
		"src/runner.py",
		"--email", email,
		"--username", username,
		"--user-id", userID,
		"--test-id", suiteID,
		"--file", testFile,
	)
	
	// Start command asynchronously
	if err := cmd.Start(); err != nil {
		cancel()
		log.Printf("❌ Failed to start container: %v", err)
		http.Error(w, "Failed to start test execution", http.StatusInternalServerError)
		return
	}
	
	// Get container ID
	containerID := fmt.Sprintf("runner_%s", suiteID)
	
	// Track execution
	h.tracker.Add(suiteID, containerID, cancel)
	
	// Return immediate response
	response := map[string]interface{}{
		"success":    true,
		"message":    "Test execution started",
		"suite_id":   suiteID,
		"status":     "running",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	
	// Wait for completion in background goroutine
	go func() {
		defer cancel()
		defer h.tracker.Remove(suiteID)
		
		err := cmd.Wait()
		
		// Update final status based on exit code
		finalStatus := "completed"
		if err != nil {
			if ctx.Err() == context.DeadlineExceeded {
				finalStatus = "timeout"
				log.Printf("⏰ Test execution timeout: %s", suiteID)
			} else if ctx.Err() == context.Canceled {
				finalStatus = "cancelled"
				log.Printf("🛑 Test execution cancelled: %s", suiteID)
			} else {
				finalStatus = "failed"
				log.Printf("❌ Test execution failed: %v", err)
			}
		}
		
		// Update database
		updateCtx := context.Background()
		filter := bson.M{"suite_id": suiteID}
		update := bson.M{
			"$set": bson.M{
				"status":      finalStatus,
				"updated_at":  time.Now(),
				"finished_at": time.Now(),
			},
		}
		
		if _, err := h.testSuiteRepo.UpdateTestSuite(updateCtx, filter, update); err != nil {
			log.Printf("❌ Failed to update final status: %v", err)
		} else {
			log.Printf("✅ Test execution completed with status: %s", finalStatus)
		}
	}()
}
```

---

### **Scenario 2: Test Hangs/Freezes (Timeout)**

Already handled in the code above with:
```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
```

When timeout occurs:
1. Context cancels automatically
2. Docker container receives SIGTERM
3. Background goroutine detects `context.DeadlineExceeded`
4. Status set to `"timeout"`
5. Entry removed from tracker

---

### **Scenario 3: Container Fails to Start**

Handled by `cmd.Start()` error check:
```go
if err := cmd.Start(); err != nil {
	cancel()
	log.Printf("❌ Failed to start container: %v", err)
	
	// Update database to failed
	filter := bson.M{"suite_id": suiteID}
	update := bson.M{
		"$set": bson.M{
			"status":      "failed",
			"updated_at":  time.Now(),
			"finished_at": time.Now(),
		},
	}
	h.testSuiteRepo.UpdateTestSuite(r.Context(), filter, update)
	
	http.Error(w, "Failed to start test execution", http.StatusInternalServerError)
	return
}
```

---

### **Scenario 4: Database Connection Lost During Execution**

**Runner should handle this - already implemented in runner/src/database_service.py:**

```python
def save_video(self, video_data: dict) -> bool:
    if not self.connected:
        logger.warning("⚠️ Database not connected, skipping video save")
        return False  # Graceful degradation
    
    try:
        # Save to database
        # ...
    except Exception as e:
        logger.error(f"❌ Failed to save video: {e}")
        return False  # Don't crash, just log
```

**Additional safeguard - implement retry logic:**

```python
def save_with_retry(self, save_func, data, max_retries=3):
    for attempt in range(max_retries):
        try:
            return save_func(data)
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(f"❌ Failed after {max_retries} attempts: {e}")
                return False
            logger.warning(f"⚠️ Retry {attempt + 1}/{max_retries}: {e}")
            time.sleep(2 ** attempt)  # Exponential backoff
    return False
```

---

### **Scenario 5: Multiple Simultaneous Cancellations**

Already handled in `execution_tracker.go`:

```go
func (t *ExecutionTracker) Cancel(suiteID string) bool {
	t.mu.Lock()  // Mutex prevents race conditions
	defer t.mu.Unlock()
	
	info, exists := t.executions[suiteID]
	if !exists {
		return false
	}
	
	if info.Status == "cancelling" {
		log.Printf("⚠️  Execution already being cancelled: %s", suiteID)
		return false  // Prevent duplicate cancellations
	}
	
	info.Status = "cancelling"
	// ...
}
```

---

## 🔌 API Routes to Add

**File: `backend/cmd/api/main.go`**

```go
// Add these routes after existing test suite routes:

// Test execution management
router.HandleFunc("/api/test-suites/{suite_id}/cancel", 
	middleware.AuthMiddleware(runnerHandler.CancelTestSuite)).Methods("POST")

router.HandleFunc("/api/test-suites/running", 
	middleware.AuthMiddleware(runnerHandler.GetRunningTests)).Methods("GET")

router.HandleFunc("/api/test-suites/{suite_id}/status", 
	middleware.AuthMiddleware(runnerHandler.GetTestStatus)).Methods("GET")
```

---

## 🎨 Frontend Implementation

### **Add Cancel Button to History Page**

**File: `Frontend/src/pages/admin-history.tsx`**

```typescript
const [cancellingTests, setCancellingTests] = useState<Set<string>>(new Set());

const handleCancelTest = async (suiteId: string) => {
	if (!confirm("Are you sure you want to cancel this test?")) {
		return;
	}
	
	setCancellingTests(prev => new Set(prev).add(suiteId));
	
	try {
		const token = localStorage.getItem("authToken");
		const response = await fetch(
			`${API_ENDPOINTS.BASE_URL}/api/test-suites/${suiteId}/cancel`,
			{
				method: "POST",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);
		
		if (!response.ok) {
			throw new Error("Failed to cancel test");
		}
		
		const data = await response.json();
		console.log("Test cancellation initiated:", data);
		
		// Update UI to show cancelling status
		setReports(prev => prev.map(report => 
			report.suite_id === suiteId 
				? { ...report, status: "cancelling" }
				: report
		));
		
		// Refresh after 2 seconds to get final status
		setTimeout(() => {
			fetchReports();
			setCancellingTests(prev => {
				const next = new Set(prev);
				next.delete(suiteId);
				return next;
			});
		}, 2000);
		
	} catch (error) {
		console.error("Failed to cancel test:", error);
		alert("Failed to cancel test. Please try again.");
		setCancellingTests(prev => {
			const next = new Set(prev);
			next.delete(suiteId);
			return next;
		});
	}
};

// In the render section, add cancel button for running tests:

{report.status === "running" && (
	<Button
		size="sm"
		variant="outline"
		className="border-red-300 text-red-600 hover:bg-red-50"
		onClick={(e) => {
			e.stopPropagation();
			handleCancelTest(report.suite_id);
		}}
		disabled={cancellingTests.has(report.suite_id)}
	>
		{cancellingTests.has(report.suite_id) ? (
			<>
				<Loader2 className="w-4 h-4 mr-2 animate-spin" />
				Cancelling...
			</>
		) : (
			<>
				<X className="w-4 h-4 mr-2" />
				Cancel Test
			</>
		)}
	</Button>
)}
```

### **Add Status Badge for Different States**

```typescript
const getStatusBadge = (status: string) => {
	const statusConfig = {
		running: {
			className: "bg-blue-100 text-blue-700 border-blue-200 animate-pulse",
			icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />,
			label: "Running",
		},
		cancelling: {
			className: "bg-orange-100 text-orange-700 border-orange-200",
			icon: <X className="w-3 h-3 mr-1" />,
			label: "Cancelling",
		},
		cancelled: {
			className: "bg-gray-100 text-gray-700 border-gray-200",
			icon: <X className="w-3 h-3 mr-1" />,
			label: "Cancelled",
		},
		timeout: {
			className: "bg-yellow-100 text-yellow-700 border-yellow-200",
			icon: <Clock className="w-3 h-3 mr-1" />,
			label: "Timeout",
		},
		completed: {
			className: "bg-green-100 text-green-700 border-green-200",
			icon: <Check className="w-3 h-3 mr-1" />,
			label: "Completed",
		},
		failed: {
			className: "bg-red-100 text-red-700 border-red-200",
			icon: <AlertTriangle className="w-3 h-3 mr-1" />,
			label: "Failed",
		},
	};
	
	const config = statusConfig[status] || statusConfig.completed;
	
	return (
		<Badge className={config.className}>
			{config.icon}
			{config.label}
		</Badge>
	);
};
```

---

## 📊 Database Schema Updates

No changes needed! The `test_suite` model already supports these statuses:

```go
Status string `json:"status" bson:"status"` // pending, running, completed, failed, cancelled
```

Just need to add: `timeout` status

**Update: `backend/internal/models/test_suite.go`**

```go
// Status can be: pending, running, completed, failed, cancelled, timeout
Status string `json:"status" bson:"status"`
```

---

## 🧪 Testing Checklist

### Manual Testing Steps:

1. **Normal Execution:**
   - ✅ Upload test file
   - ✅ Click "Run Test"
   - ✅ Verify status shows "Running"
   - ✅ Wait for completion
   - ✅ Verify status changes to "Completed"

2. **Cancellation:**
   - ✅ Start test execution
   - ✅ Click "Cancel" button while running
   - ✅ Verify status changes to "Cancelling"
   - ✅ Verify container is killed
   - ✅ Verify final status is "Cancelled"
   - ✅ Verify artifacts saved before cancellation are preserved

3. **Timeout:**
   - ✅ Create a test that runs > 30 minutes
   - ✅ Start execution
   - ✅ Wait for timeout
   - ✅ Verify status changes to "Timeout"
   - ✅ Verify container is killed

4. **Multiple Cancellations:**
   - ✅ Start test
   - ✅ Click cancel multiple times rapidly
   - ✅ Verify only one cancellation is processed
   - ✅ Verify no errors occur

5. **Container Failure:**
   - ✅ Stop Selenium containers
   - ✅ Try to start test
   - ✅ Verify error message
   - ✅ Verify status marked as "Failed"

---

## 🔒 Security Considerations

1. **Authorization Check:**
   - Users can only cancel their own tests
   - Admins can cancel any test
   
   ```go
   // Add to CancelTestSuite handler:
   if suite.UserID.Hex() != claims.UserID && claims.Role != "admin" {
       http.Error(w, "Unauthorized to cancel this test", http.StatusForbidden)
       return
   }
   ```

2. **Rate Limiting:**
   - Prevent spam cancellation requests
   - Max 5 cancellations per minute per user

3. **Audit Logging:**
   - Log who cancelled which test and when
   - Store in dedicated `audit_log` collection

---

## 📝 Summary

### What This Solves:
✅ User can cancel running tests  
✅ Automatic timeout after 30 minutes  
✅ Proper cleanup when cancelled  
✅ No orphaned containers  
✅ No race conditions  
✅ Database consistency maintained  
✅ Clear UI feedback  
✅ Proper error handling  

### Implementation Priority:
1. **HIGH:** Update `runner_handler.go` for async execution
2. **HIGH:** Add cancel endpoint routing in `main.go`
3. **HIGH:** Add cancel button in frontend
4. **MEDIUM:** Add timeout status to model
5. **MEDIUM:** Implement retry logic for database saves
6. **LOW:** Add audit logging
7. **LOW:** Add rate limiting

### Estimated Implementation Time:
- Backend: 2-3 hours
- Frontend: 1-2 hours
- Testing: 1-2 hours
- **Total: 4-7 hours**

---

## 🎯 Next Steps

1. Review this implementation plan
2. Test the existing `execution_tracker.go` and `cancel_handler.go`
3. Update `runner_handler.go` with async execution
4. Add routes to `main.go`
5. Implement frontend cancel button
6. Test all scenarios
7. Deploy and monitor

Let me know when you're ready to proceed with implementation!
