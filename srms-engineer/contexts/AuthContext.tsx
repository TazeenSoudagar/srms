"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { logout as apiLogout, getProfile } from "@/lib/api/auth-helpers";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("engineer_token");
    const stored = localStorage.getItem("engineer_user");
    if (token && stored) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        localStorage.removeItem("engineer_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("engineer_token", token);
    localStorage.setItem("engineer_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore — token may already be invalid
    } finally {
      localStorage.removeItem("engineer_token");
      localStorage.removeItem("engineer_user");
      setUser(null);
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const res = await getProfile();
      const updated = res.data.data;
      setUser(updated);
      localStorage.setItem("engineer_user", JSON.stringify(updated));
    } catch {
      // silently fail
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
