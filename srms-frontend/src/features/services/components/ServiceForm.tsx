import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { serviceService } from '../../../services/serviceService'
import { Layout } from '../../../components/layout/Layout'
import { Button } from '../../../components/common/Button'
import { Input } from '../../../components/common/Input'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  is_active: z.boolean().default(true),
})

interface ServiceFormProps {
  isEdit?: boolean
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (isEdit && id) {
      fetchService()
    }
  }, [isEdit, id])

  const fetchService = async () => {
    if (!id) return
    setIsLoadingData(true)
    try {
      const service = await serviceService.getService(id)
      reset({
        name: service.name,
        description: service.description,
        is_active: service.is_active,
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load service')
    } finally {
      setIsLoadingData(false)
    }
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      if (isEdit && id) {
        await serviceService.updateService(id, {
          name: data.name,
          description: data.description,
          is_active: data.is_active,
        })
      } else {
        await serviceService.createService({
          name: data.name,
          description: data.description,
          is_active: data.is_active,
        })
      }
      navigate('/services')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save service. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Service' : 'Create Service'}
          </h1>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-6">
            {error && <ErrorMessage message={error} />}

            <Input
              label="Service Name"
              {...register('name')}
              error={errors.name?.message}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

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
                onClick={() => navigate('/services')}
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
