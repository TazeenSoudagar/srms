import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("engineer_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("engineer_token");
        localStorage.removeItem("engineer_user");
        window.location.href = "/login";
      }
    } else if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (status === 422) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors as Record<string, string[]>)[0];
        toast.error(Array.isArray(first) ? first[0] : String(first));
      } else {
        toast.error(message ?? "Validation error.");
      }
    } else if (status === 404) {
      toast.error("Resource not found.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (!status) {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
