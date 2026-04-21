import apiClient from "./client";
import type { User } from "@/lib/types";

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const sendOtp = (email: string) =>
  apiClient.post("/auth/send-otp", { email, type: "login" });

export const verifyOtp = (email: string, otp: string) =>
  apiClient.post<AuthResponse>("/auth/verify-otp", { email, otp, type: "login" });

export const loginWithPassword = (email: string, password: string) =>
  apiClient.post<AuthResponse>("/auth/login-password", { email, password });

export const logout = () => apiClient.post("/auth/logout");
