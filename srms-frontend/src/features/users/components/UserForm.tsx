import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { userService } from '../../../services/userService'
import { Layout } from '../../../components/layout/Layout'
import { Button } from '../../../components/common/Button'
import { Input } from '../../../components/common/Input'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'

const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(255),
  last_name: z.string().min(1, 'Last name is required').max(255),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  role_id: z.string().min(1, 'Please select a role'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  is_active: z.boolean().default(true),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  initialData?: Partial<UserFormData>
  isEdit?: boolean
}

export const UserForm: React.FC<UserFormProps> = ({ initialData, isEdit = false }) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit && id) {
      fetchUser()
    }
  }, [isEdit, id])

  const fetchUser = async () => {
    if (!id) return
    setIsLoadingData(true)
    try {
      const user = await userService.getUser(id)
      // Set form values with user data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user')
    } finally {
      setIsLoadingData(false)
    }
  }

  const [roles, setRoles] = useState([
    { id: '1', name: 'Admin' },
    { id: '2', name: 'Support Engineer' },
    { id: '3', name: 'Client' },
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role_id: '',
      password: '',
      is_active: true,
    },
  })

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      if (isEdit && id) {
        const updateData: any = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          role_id: parseInt(data.role_id),
          is_active: data.is_active,
        }
        if (data.password) {
          updateData.password = data.password
        }
        await userService.updateUser(id, updateData)
      } else {
        await userService.createUser({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || '',
          role_id: parseInt(data.role_id),
          password: data.password || '',
          is_active: data.is_active,
        })
      }
      navigate('/users')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit User' : 'Create User'}
          </h1>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role_id')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.role_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className="mt-1 text-sm text-red-600">{errors.role_id.message}</p>
            )}
          </div>

          <Input
            label={isEdit ? 'Password (leave blank to keep current)' : 'Password'}
            type="password"
            {...register('password')}
            error={errors.password?.message}
            required={!isEdit}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/users')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
        )}
      </div>
    </Layout>
  )
}
