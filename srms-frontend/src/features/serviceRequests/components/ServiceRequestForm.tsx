import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Button } from '../../../components/common/Button'
import { Input } from '../../../components/common/Input'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { SuccessMessage } from '../../../components/ui/SuccessMessage'
import { serviceRequestService, serviceService } from '../../../services/serviceRequestService'
import type { Service } from '../types'

const serviceRequestSchema = z.object({
  service_id: z.string().min(1, 'Please select a service'),
  title: z.string().min(1, 'Title is required').max(255, 'Title cannot exceed 255 characters'),
  description: z.string().max(5000, 'Description cannot exceed 5000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high'], { message: 'Priority is required' }),
  due_date: z.string().optional(),
})

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>

interface ServiceRequestFormProps {
  initialData?: Partial<ServiceRequestFormData>
  isEdit?: boolean
}

export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  initialData,
  isEdit = false,
}) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetchServices()
    if (isEdit && id) {
      fetchServiceRequest()
    }
  }, [isEdit, id])

  const fetchServices = async () => {
    try {
      const data = await serviceService.getServices()
      setServices(data.filter((s) => s.is_active))
    } catch (err) {
      setError('Failed to load services')
    }
  }

  const fetchServiceRequest = async () => {
    if (!id) return
    setIsLoadingData(true)
    try {
      await serviceRequestService.getServiceRequest(id)
      // Set form values
      // Note: service_id needs to be the hashed ID from the API
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load service request')
    } finally {
      setIsLoadingData(false)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: initialData || {
      service_id: '',
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
    },
  })

  const onSubmit = async (data: ServiceRequestFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isEdit && id) {
        await serviceRequestService.updateServiceRequest(id, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          due_date: data.due_date,
        })
        setSuccess('Service request updated successfully!')
        setTimeout(() => navigate(`/service-requests/${id}`), 1500)
      } else {
        const created = await serviceRequestService.createServiceRequest({
          service_id: data.service_id,
          title: data.title,
          description: data.description,
          priority: data.priority,
          due_date: data.due_date,
        })
        setSuccess('Service request created successfully!')
        setTimeout(() => navigate(`/service-requests/${created.id}`), 1500)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save service request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Service Request' : 'Create Service Request'}
          </h1>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-6">
            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message={success} />}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service <span className="text-red-500">*</span>
              </label>
              <select
                {...register('service_id')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.service_id ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              {errors.service_id && (
                <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
              )}
            </div>

            <Input
              label="Title"
              placeholder="Enter service request title"
              {...register('title')}
              error={errors.title?.message}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter detailed description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                {...register('priority')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.priority ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            <Input
              label="Due Date"
              type="date"
              {...register('due_date')}
              error={errors.due_date?.message}
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/service-requests')}
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
