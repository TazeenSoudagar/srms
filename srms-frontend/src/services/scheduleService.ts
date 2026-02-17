import api from './api';

export interface Schedule {
  id: string;
  service_request: {
    id: string;
    title: string;
    service: {
      id: string;
      name: string;
    };
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  engineer: {
    id: string;
    name: string;
    email: string;
  } | null;
  scheduled_at: string;
  scheduled_at_formatted: string;
  completed_at: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  location: string | null;
  estimated_duration_minutes: number;
  estimated_end_time: string;
  is_editable: boolean;
  is_cancellable: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleRequest {
  service_request_id: string;
  scheduled_at: string;
  engineer_id?: string;
  notes?: string;
  location?: string;
  estimated_duration_minutes?: number;
}

export interface UpdateScheduleRequest {
  scheduled_at?: string;
  engineer_id?: string;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  location?: string;
  estimated_duration_minutes?: number;
}

export interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: TimeSlot[];
}

export interface ScheduleListParams {
  status?: string;
  start_date?: string;
  end_date?: string;
  upcoming?: boolean;
  page?: number;
}

export interface ScheduleListResponse {
  data: Schedule[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const scheduleService = {
  async getSchedules(params: ScheduleListParams = {}): Promise<ScheduleListResponse> {
    const response = await api.get('/schedules', { params });
    return response.data;
  },

  async getSchedule(id: string): Promise<{ data: Schedule }> {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  async createSchedule(data: CreateScheduleRequest): Promise<{ message: string; data: Schedule }> {
    const response = await api.post('/schedules', data);
    return response.data;
  },

  async updateSchedule(id: string, data: UpdateScheduleRequest): Promise<{ message: string; data: Schedule }> {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },

  async cancelSchedule(id: string): Promise<{ message: string; data: Schedule }> {
    const response = await api.post(`/schedules/${id}/cancel`);
    return response.data;
  },

  async completeSchedule(id: string): Promise<{ message: string; data: Schedule }> {
    const response = await api.post(`/schedules/${id}/complete`);
    return response.data;
  },

  async getAvailableSlots(date: string, engineerId?: string): Promise<AvailableSlotsResponse> {
    const params: any = { date };
    if (engineerId) {
      params.engineer_id = engineerId;
    }
    const response = await api.get('/schedules/available-slots', { params });
    return response.data;
  },
};

export default scheduleService;
