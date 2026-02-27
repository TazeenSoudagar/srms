import { apiClient, ApiResponse } from './client';
import { User } from '../types/user';

export interface SendOtpDto {
  email: string;
  type: 'login' | 'password-reset';
}

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
  type?: 'login' | 'password-reset';
}

export interface VerifyOtpResponse {
  token: string;
  user: User;
}

export const authApi = {
  /**
   * Send OTP to user's email
   */
  sendOtp: async (data: SendOtpDto): Promise<SendOtpResponse> => {
    const response = await apiClient.post<SendOtpResponse>(
      '/auth/send-otp',
      data
    );
    return response.data;
  },

  /**
   * Verify OTP and get authentication token
   */
  verifyOtp: async (data: VerifyOtpDto): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<VerifyOtpResponse>(
      '/auth/verify-otp',
      data
    );

    // Store token and user in localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current authenticated user
   */
  me: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};
