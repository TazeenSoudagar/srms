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

const passwordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const LoginForm: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('password')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: '',
      password: '',
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

  const onPasswordSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await authService.loginPassword(data.email, data.password)
      login(response.token, response.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
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
            {loginMethod === 'password'
              ? 'Enter your email and password'
              : step === 'email'
              ? 'Enter your email to receive an OTP'
              : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {/* Login Method Tabs */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password')
                setStep('email')
                setError(null)
                setSuccess(null)
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                loginMethod === 'password'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp')
                setStep('email')
                setError(null)
                setSuccess(null)
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                loginMethod === 'otp'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              OTP Login
            </button>
          </div>

          {error && <ErrorMessage message={error} className="mb-4" />}
          {success && <SuccessMessage message={success} className="mb-4" />}

          {loginMethod === 'password' ? (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...passwordForm.register('email')}
                error={passwordForm.formState.errors.email?.message}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...passwordForm.register('password')}
                  error={passwordForm.formState.errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
              </Button>
            </form>
          ) : step === 'email' ? (
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
