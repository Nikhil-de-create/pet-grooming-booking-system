import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/check", {
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.isAdmin);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (username: string, password: string) => {
    try {
      const res = await apiRequest("POST", "/api/admin/login", { username, password });
      const data = await res.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        return;
      }
      
      throw new Error("Login failed");
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout", {});
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}