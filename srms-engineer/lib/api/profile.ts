import apiClient from "./client";
import type { User } from "@/lib/types";

export const getProfile = () =>
  apiClient.get<{ data: User }>("/profile");

export const updateProfile = (data: Partial<Pick<User, "first_name" | "last_name" | "bio" | "specializations" | "availability_status">>) =>
  apiClient.put<{ data: User }>("/profile", data);

export const uploadAvatar = (file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return apiClient.post<{ data: User }>("/profile/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
