import apiClient from "./client";
import type { Schedule, PaginatedResponse } from "@/lib/types";

export const getSchedules = (params?: { status?: string; page?: number; upcoming?: boolean }) =>
  apiClient.get<PaginatedResponse<Schedule>>("/schedules", { params });
