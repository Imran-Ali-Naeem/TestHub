import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/lib/userContext";
import { UserManagementProvider } from "@/lib/userManagementContext";
import { AuthProvider } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
import TesterDashboard from "@/pages/tester-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import CreateSuite from "@/pages/create-suite";
import AdminCreateSuite from "@/pages/admin-create-suite";
import ExecutionMonitor from "@/pages/execution-monitor";
import Reports from "@/pages/reports";
import AdminHistory from "@/pages/admin-history";
import AdminUserWork from "@/pages/admin-user-work";
import UserManagement from "@/pages/user-management";
import Profile from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth">
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <TesterDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/create">
        <ProtectedRoute>
          <AdminCreateSuite />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/history">
        <ProtectedRoute>
          <AdminHistory />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/user-work">
        <ProtectedRoute>
          <AdminUserWork />
        </ProtectedRoute>
      </Route>
      <Route path="/create">
        <ProtectedRoute>
          <CreateSuite />
        </ProtectedRoute>
      </Route>
      <Route path="/monitor">
        <ProtectedRoute>
          <ExecutionMonitor />
        </ProtectedRoute>
      </Route>
      <Route path="/history">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserManagementProvider>
          <UserProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </UserProvider>
        </UserManagementProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
