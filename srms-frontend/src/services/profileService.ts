import api from './api'

export interface UpdateProfileData {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface ProfileResponse {
  data: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    is_active: boolean
    initials: string
    avatar: {
      id: string
      name: string
      url: string
    } | null
    role: {
      id: string
      name: string
    }
    created_at: string
    updated_at: string
  }
}

export interface AvatarUploadResponse {
  message: string
  avatar: {
    id: string
    name: string
    url: string
  }
}

class ProfileService {
  /**
   * Get current user's profile
   */
  async getProfile() {
    const response = await api.get<ProfileResponse>('/profile')
    return response.data
  }

  /**
   * Update current user's profile
   */
  async updateProfile(data: UpdateProfileData) {
    const response = await api.put<ProfileResponse>('/profile', data)
    return response.data
  }

  /**
   * Change current user's password
   */
  async changePassword(data: ChangePasswordData) {
    const response = await api.post<{ message: string }>('/profile/change-password', data)
    return response.data
  }

  /**
   * Upload profile picture/avatar
   */
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post<AvatarUploadResponse>('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  /**
   * Delete profile picture/avatar
   */
  async deleteAvatar() {
    const response = await api.delete<{ message: string }>('/profile/avatar')
    return response.data
  }
}

export const profileService = new ProfileService()
