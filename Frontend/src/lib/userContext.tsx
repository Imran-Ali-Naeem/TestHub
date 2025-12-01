import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserProfile {
  username: string;
  email: string;
  avatar: string | null;
  avatarType: "gradient" | "image";
  selectedAvatarIndex: number;
  role: "Admin" | "Tester" | null;
  isLoggedIn: boolean;
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  login: (username: string, email: string, role: "Admin" | "Tester") => void;
  logout: () => void;
}

const defaultAvatars = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
];

const defaultProfile: UserProfile = {
  username: "Guest",
  email: "",
  avatar: defaultAvatars[0],
  avatarType: "gradient",
  selectedAvatarIndex: 0,
  role: null,
  isLoggedIn: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultProfile;
      }
    }
    return defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const login = (username: string, email: string, role: "Admin" | "Tester") => {
    setProfile(prev => ({
      ...prev,
      username,
      email,
      role,
      isLoggedIn: true,
    }));
  };

  const logout = () => {
    setProfile({
      ...defaultProfile,
      avatar: profile.avatar,
      avatarType: profile.avatarType,
      selectedAvatarIndex: profile.selectedAvatarIndex,
    });
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export { defaultAvatars };
