// API Configuration
// This file centralizes all API endpoint URLs

// Gateway URL - NGINX reverse proxy
// In development: http://localhost (port 80)
// In production: Your domain URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/users/signup`,
  GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google`,
  GOOGLE_VERIFY_PASSWORD: `${API_BASE_URL}/api/auth/google/verify-password`,
  SET_PASSWORD: `${API_BASE_URL}/api/users/set-password`,
  ME: `${API_BASE_URL}/api/auth/me`,
};
