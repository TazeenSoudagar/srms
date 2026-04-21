import apiClient from "./client";
import type { Schedule, PaginatedResponse } from "@/lib/types";

export const getSchedules = (params?: { status?: string; page?: number }) =>
  apiClient.get<PaginatedResponse<Schedule>>("/schedules", { params });
