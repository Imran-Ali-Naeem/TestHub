import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Tester";
  status: "Active" | "Inactive";
  lastActive: string;
  joinedDate: string;
  company?: string;
}

export interface SignupRequest {
  id: number;
  name: string;
  email: string;
  password: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface UserManagementContextType {
  users: User[];
  signupRequests: SignupRequest[];
  addUser: (user: Omit<User, "id" | "lastActive" | "joinedDate">) => void;
  updateUser: (id: number, updates: Partial<User>) => void;
  deleteUser: (id: number) => void;
  addSignupRequest: (request: Omit<SignupRequest, "id" | "requestDate" | "status">) => void;
  approveSignupRequest: (id: number, role: "Admin" | "Tester") => void;
  rejectSignupRequest: (id: number) => void;
  validateLogin: (email: string, password: string) => { valid: boolean; role?: "Admin" | "Tester"; name?: string };
}

const defaultUsers: User[] = [
  { 
    id: 1, 
    name: "Imran Admin", 
    email: "imran@gmail.com", 
    password: "123",
    role: "Admin", 
    status: "Active", 
    lastActive: "Just now", 
    joinedDate: "Jan 12, 2024"
  },
  { 
    id: 2, 
    name: "John Smith", 
    email: "john@test.com", 
    password: "test123",
    role: "Tester", 
    status: "Active", 
    lastActive: "2h ago", 
    joinedDate: "Feb 04, 2024"
  },
  { 
    id: 3, 
    name: "Alice Johnson", 
    email: "alice@test.com", 
    password: "test123",
    role: "Tester", 
    status: "Active", 
    lastActive: "1d ago", 
    joinedDate: "Mar 20, 2024"
  },
];

const defaultSignupRequests: SignupRequest[] = [
  {
    id: 1,
    name: "Sarah Wilson",
    email: "sarah@company.com",
    password: "sarah123",
    requestDate: "Nov 28, 2025",
    status: "Pending"
  },
  {
    id: 2,
    name: "Mike Brown",
    email: "mike@startup.io",
    password: "mike123",
    requestDate: "Nov 29, 2025",
    status: "Pending"
  }
];

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("testhub_users");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultUsers;
      }
    }
    return defaultUsers;
  });

  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>(() => {
    const saved = localStorage.getItem("testhub_signup_requests");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSignupRequests;
      }
    }
    return defaultSignupRequests;
  });

  useEffect(() => {
    localStorage.setItem("testhub_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("testhub_signup_requests", JSON.stringify(signupRequests));
  }, [signupRequests]);

  const addUser = (userData: Omit<User, "id" | "lastActive" | "joinedDate">) => {
    const newUser: User = {
      ...userData,
      id: Date.now(),
      lastActive: "Just now",
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: number, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const addSignupRequest = (requestData: Omit<SignupRequest, "id" | "requestDate" | "status">) => {
    const newRequest: SignupRequest = {
      ...requestData,
      id: Date.now(),
      requestDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Pending",
    };
    setSignupRequests(prev => [...prev, newRequest]);
  };

  const approveSignupRequest = (id: number, role: "Admin" | "Tester") => {
    const request = signupRequests.find(r => r.id === id);
    if (request) {
      addUser({
        name: request.name,
        email: request.email,
        password: request.password,
        role: role,
        status: "Active",
      });
      setSignupRequests(prev => prev.map(r => 
        r.id === id ? { ...r, status: "Approved" as const } : r
      ));
    }
  };

  const rejectSignupRequest = (id: number) => {
    setSignupRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: "Rejected" as const } : r
    ));
  };

  const validateLogin = (email: string, password: string): { valid: boolean; role?: "Admin" | "Tester"; name?: string } => {
    const user = users.find(u => u.email === email && u.password === password && u.status === "Active");
    if (user) {
      return { valid: true, role: user.role, name: user.name };
    }
    return { valid: false };
  };

  return (
    <UserManagementContext.Provider value={{
      users,
      signupRequests,
      addUser,
      updateUser,
      deleteUser,
      addSignupRequest,
      approveSignupRequest,
      rejectSignupRequest,
      validateLogin,
    }}>
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error("useUserManagement must be used within a UserManagementProvider");
  }
  return context;
}
