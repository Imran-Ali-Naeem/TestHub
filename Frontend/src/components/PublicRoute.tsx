import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/authContext';

/**
 * PublicRoute Component
 * 
 * Purpose: Redirect authenticated users away from public pages
 * - Redirects to /dashboard if user is already authenticated
 * - Prevents logged-in users from accessing login/signup pages
 */

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'Admin') {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
