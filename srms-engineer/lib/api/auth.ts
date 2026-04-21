import apiClient from "./client";
import type { User } from "@/lib/types";

export interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}

export const sendOtp = (email: string) =>
  apiClient.post("/auth/send-otp", { email, type: "login" });

export const verifyOtp = (email: string, otp: string) =>
  apiClient.post<AuthResponse>("/auth/verify-otp", { email, otp, type: "login" });

export const logout = () => apiClient.post("/auth/logout");
