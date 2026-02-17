import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { profileService } from '../../../services/profileService'
import { Button } from '../../../components/common/Button'
import { Input } from '../../../components/common/Input'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { Toast } from '../../../components/ui/Toast'

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    new_password_confirmation: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Passwords do not match',
    path: ['new_password_confirmation'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export const ChangePasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await profileService.changePassword(data)
      setShowSuccessToast(true)
      reset()
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to change password. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && <ErrorMessage message={error} />}

        <Input
          label="Current Password"
          type="password"
          {...register('current_password')}
          error={errors.current_password?.message}
          required
        />

        <Input
          label="New Password"
          type="password"
          {...register('new_password')}
          error={errors.new_password?.message}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          {...register('new_password_confirmation')}
          error={errors.new_password_confirmation?.message}
          required
        />

        <div className="pt-2">
          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Changing Password...</span>
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
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </>
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-xs font-medium text-amber-900">Password Requirements</p>
              <p className="text-xs text-amber-700 mt-1">
                Use at least 8 characters with a mix of letters, numbers, and symbols for better security.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          message="Password changed successfully!"
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  )
}
