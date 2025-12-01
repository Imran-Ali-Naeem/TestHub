import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

/**
 * JWT Auth Context
 * 
 * Purpose: Manage JWT authentication state
 * - Store JWT token in localStorage
 * - Auto-attach JWT to API requests
 * - Check token expiry
 * - Provide login/logout functions
 */

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Initialize: Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      
      if (storedToken) {
        // Verify token with backend
        try {
          const response = await fetch('http://localhost:8080/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setToken(storedToken);
            setUser(data.data);
          } else {
            // Token invalid or expired
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    // Clear JWT token
    localStorage.removeItem('authToken');
    
    // Also clear legacy userProfile to ensure full logout
    localStorage.removeItem('userProfile');
    
    setToken(null);
    setUser(null);
    setLocation('/auth');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to make authenticated API requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, clear token and redirect to login
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/auth';
  }

  return response;
}
