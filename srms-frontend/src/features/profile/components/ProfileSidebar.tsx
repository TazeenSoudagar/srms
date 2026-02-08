import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../../contexts/AuthContext'
import { profileService } from '../../../services/profileService'
import { Avatar } from '../../../components/common/Avatar'
import { Button } from '../../../components/common/Button'
import { Input } from '../../../components/common/Input'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { Toast } from '../../../components/ui/Toast'
import { ProfilePictureUpload } from './ProfilePictureUpload'
import { ChangePasswordForm } from './ChangePasswordForm'

interface ProfileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(255),
  last_name: z.string().min(1, 'Last name is required').max(255),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'details' | 'picture' | 'password'>('details')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user
      ? {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone || '',
        }
      : undefined,
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await profileService.updateProfile(data)
      updateUser(response.data)
      setShowSuccessToast(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      onClose()
    }
  }

  if (!user) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">My Profile</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <Avatar
              src={user.avatar?.url}
              alt={`${user.first_name} ${user.last_name}`}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-lg">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-blue-100">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-white/20 rounded text-xs">
                {user.role.name}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('picture')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'picture'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile Picture
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Password
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Details Tab */}
          {activeTab === 'details' && (
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && <ErrorMessage message={error} />}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    {...register('first_name')}
                    error={errors.first_name?.message}
                    required
                  />
                  <Input
                    label="Last Name"
                    {...register('last_name')}
                    error={errors.last_name?.message}
                    required
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  required
                />

                <Input
                  label="Phone"
                  type="tel"
                  {...register('phone')}
                  error={errors.phone?.message}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Update Profile'}
                </Button>
              </form>
            </div>
          )}

          {/* Profile Picture Tab */}
          {activeTab === 'picture' && <ProfilePictureUpload />}

          {/* Change Password Tab */}
          {activeTab === 'password' && <ChangePasswordForm />}
        </div>

        {/* Footer with Logout */}
        <div className="border-t border-gray-200 p-6">
          <Button
            type="button"
            variant="outline"
            className="w-full text-red-600 hover:bg-red-50 border-red-300"
            onClick={handleLogout}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </Button>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          message="Profile updated successfully!"
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </>
  )
}
