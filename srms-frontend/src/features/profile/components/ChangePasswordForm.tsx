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
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <LoadingSpinner size="sm" /> : 'Change Password'}
        </Button>
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
