import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary-600 to-primary-700 mb-4 shadow-lg shadow-primary-600/20">
            <span className="text-white font-bold text-2xl">SR</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back
          </h2>
          <p className="text-slate-600">
            {loginMethod === 'password'
              ? 'Sign in to your account'
              : step === 'email'
              ? "We'll send you a one-time code"
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        <div className="bg-white py-8 px-8 shadow-xl rounded-2xl border border-slate-200">
          {/* Login Method Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password')
                setStep('email')
                setError(null)
                setSuccess(null)
              }}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                loginMethod === 'password'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp')
                setStep('email')
                setError(null)
                setSuccess(null)
              }}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                loginMethod === 'otp'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OTP
            </button>
          </div>

          {error && <ErrorMessage message={error} className="mb-4" />}
          {success && <SuccessMessage message={success} className="mb-4" />}

          {loginMethod === 'password' ? (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...passwordForm.register('email')}
                error={passwordForm.formState.errors.email?.message}
              />
              <div>
                <label htmlFor="password-input" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-2.5 pr-12 border-2 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                      passwordForm.formState.errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    {...passwordForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordForm.formState.errors.password?.message && (
                  <p className="mt-1.5 text-sm text-red-600 font-medium">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
              </Button>
            </form>
          ) : step === 'email' ? (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...emailForm.register('email')}
                error={emailForm.formState.errors.email?.message}
              />
              <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Send Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-5">
              <Input
                label="Verification Code"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                {...otpForm.register('otp')}
                error={otpForm.formState.errors.otp?.message}
              />
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={() => {
                    setStep('email')
                    setError(null)
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" size="lg" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Verify'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
