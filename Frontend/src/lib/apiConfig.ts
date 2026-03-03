// API Configuration
// This file centralizes all API endpoint URLs

// Backend API URL - Direct connection to backend (no gateway)
// In development: http://localhost:8080
// In production: Your backend URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/users/signup`,
  GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google`,
  GOOGLE_VERIFY_PASSWORD: `${API_BASE_URL}/api/auth/google/verify-password`,
  SET_PASSWORD: `${API_BASE_URL}/api/users/set-password`,
  ME: `${API_BASE_URL}/api/auth/me`,
  
  // Test Suites (Suite Definitions - templates for test collections)
  SUITES: `${API_BASE_URL}/api/suites`,
  SUITE_DETAILS: (suiteId: string) => `${API_BASE_URL}/api/suites/${suiteId}`,
  SUITE_TEST_CASES: (suiteId: string) => `${API_BASE_URL}/api/suites/${suiteId}/test-cases`,
  SUITE_RUN: (suiteId: string) => `${API_BASE_URL}/api/suites/${suiteId}/run`,
  
  // Test Runs (Execution records)
  RUNS: `${API_BASE_URL}/api/runs`,
  RUN_DETAILS: (runId: string) => `${API_BASE_URL}/api/runs/${runId}`,
  RUN_RESULTS: (runId: string) => `${API_BASE_URL}/api/runs/${runId}/results`,
  
  // Run Artifacts
  RUN_SCREENSHOTS: (runId: string) => `${API_BASE_URL}/api/runs/${runId}/screenshots`,
  RUN_LOGS: (runId: string) => `${API_BASE_URL}/api/runs/${runId}/logs`,
  RUN_VIDEOS: (runId: string) => `${API_BASE_URL}/api/runs/${runId}/videos`,
  
  // Result Artifacts (for specific test result)
  RESULT_SCREENSHOTS: (resultId: string) => `${API_BASE_URL}/api/artifacts/results/${resultId}/screenshots`,
  RESULT_LOGS: (resultId: string) => `${API_BASE_URL}/api/artifacts/results/${resultId}/logs`,
  RESULT_VIDEOS: (resultId: string) => `${API_BASE_URL}/api/artifacts/results/${resultId}/videos`,
  
  // Artifact Binary Data Endpoints
  SCREENSHOT_IMAGE: (screenshotId: string) => `${API_BASE_URL}/api/screenshots/${screenshotId}`,
  VIDEO_STREAM: (videoId: string) => `${API_BASE_URL}/api/videos/${videoId}`,
  
  // Legacy endpoints (for backward compatibility during migration)
  TEST_SUITES: `${API_BASE_URL}/api/suites`,  // Maps to new SUITES
  TEST_SUITE_DETAILS: (suiteId: string) => `${API_BASE_URL}/api/runs/${suiteId}`,  // Maps to run details for history
  TESTER_TEST_RESULTS_SCREENSHOTS: (testId: string) => `${API_BASE_URL}/api/runs/${testId}/screenshots`,
  TESTER_TEST_RESULTS_LOGS: (testId: string) => `${API_BASE_URL}/api/runs/${testId}/logs`,
  TESTER_TEST_RESULTS_VIDEOS: (testId: string) => `${API_BASE_URL}/api/runs/${testId}/videos`,
  ADMIN_TEST_RESULTS_SCREENSHOTS: (testId: string) => `${API_BASE_URL}/api/runs/${testId}/screenshots`,
  ADMIN_TEST_RESULTS_LOGS: (testId: string) => `${API_BASE_URL}/api/runs/${testId}/logs`,
  ADMIN_TEST_RESULTS_VIDEOS: (testId: string) => `${API_BASE_URL}/api/runs/${testId}/videos`,
};
