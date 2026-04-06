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

export interface RegisterDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface VerifyRegistrationOtpDto {
  email: string;
  otp: string;
}

export interface VerifyRegistrationOtpResponse {
  message: string;
  email: string;
}

export interface SetPasswordDto {
  email: string;
  password: string;
  password_confirmation: string;
}

export interface SetPasswordResponse {
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

  /**
   * Register a new user (Client role)
   */
  register: async (data: RegisterDto): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      '/auth/register',
      data
    );
    return response.data;
  },

  /**
   * Verify OTP after registration
   */
  verifyRegistrationOtp: async (data: VerifyRegistrationOtpDto): Promise<VerifyRegistrationOtpResponse> => {
    const response = await apiClient.post<VerifyRegistrationOtpResponse>(
      '/auth/verify-registration-otp',
      data
    );
    return response.data;
  },

  /**
   * Set password after OTP verification
   */
  setPassword: async (data: SetPasswordDto): Promise<SetPasswordResponse> => {
    const response = await apiClient.post<SetPasswordResponse>(
      '/auth/set-password',
      data
    );

    // Store token and user in localStorage (auto-login)
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },
};
