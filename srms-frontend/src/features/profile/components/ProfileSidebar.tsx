import React, { useState } from 'react'
import { createPortal } from 'react-dom'
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

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-50 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        role="presentation"
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h2>
              <p className="text-sm text-slate-600 mt-1">Manage your account settings</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
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

          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <Avatar
              src={user.avatar?.url}
              alt={`${user.first_name} ${user.last_name}`}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-slate-900 truncate">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-slate-600 truncate">{user.email}</p>
              <span className="inline-block mt-2 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-medium">
                {user.role.name}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'details'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('picture')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'picture'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Profile Picture
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'password'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Password
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-slate-50">
          {/* Personal Details Tab */}
          {activeTab === 'details' && (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <div className="pt-2">
                  <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        Update Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Profile Picture Tab */}
          {activeTab === 'picture' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <ProfilePictureUpload />
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <ChangePasswordForm />
            </div>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="border-t border-slate-200 p-6 bg-white sticky bottom-0">
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            size="lg"
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
    </>,
    document.body
  )
}
