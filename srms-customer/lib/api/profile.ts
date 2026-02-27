import { apiClient, ApiResponse } from './client';
import { User, UserProfile, UpdateProfileDto } from '../types/user';

export const profileApi = {
  /**
   * Get current user's profile
   */
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileDto): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/profile', data);

    // Update user in localStorage
    if (response.data.data) {
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        const updatedUser = { ...user, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }

    return response.data;
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<User>>('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update user in localStorage
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }

    return response.data;
  },

  /**
   * Delete user avatar
   */
  deleteAvatar: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.delete<ApiResponse<User>>('/profile/avatar');

    // Update user in localStorage
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }

    return response.data;
  },
};
