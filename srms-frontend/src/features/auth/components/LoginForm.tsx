import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../../components/common/Button'
import { Input } from '../../../components/common/Input'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { useAuth } from '../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/authService'
import { SuccessMessage } from '../../../components/ui/SuccessMessage'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
})

export const LoginForm: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: '',
      otp: '',
    },
  })

  const onEmailSubmit = async (data: { email: string }) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setEmail(data.email)

    try {
      await authService.sendOtp(data.email, 'login')
      setSuccess('OTP sent successfully! Please check your email.')
      setStep('otp')
      otpForm.setValue('email', data.email)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onOtpSubmit = async (data: { email: string; otp: string }) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await authService.verifyOtp(data.email, data.otp, 'login')
      login(response.token, response.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to SRMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email'
              ? 'Enter your email to receive an OTP'
              : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {error && <ErrorMessage message={error} className="mb-4" />}
          {success && <SuccessMessage message={success} className="mb-4" />}

          {step === 'email' ? (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...emailForm.register('email')}
                error={emailForm.formState.errors.email?.message}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <Input
                label="OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                {...otpForm.register('otp')}
                error={otpForm.formState.errors.otp?.message}
              />
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep('email')
                    setError(null)
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Verify OTP'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
