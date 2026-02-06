import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Button } from '../../../components/common/Button'
import { Badge } from '../../../components/common/Badge'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import type { ServiceRequest } from '../types'
import { serviceRequestService } from '../../../services/serviceRequestService'
import { CommentsSection } from '../../comments/components/CommentsSection'
import { AttachmentsSection } from '../../media/components/AttachmentsSection'

export const ServiceRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null)

  useEffect(() => {
    if (id) {
      fetchServiceRequest()
    }
  }, [id])

  const fetchServiceRequest = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const data = await serviceRequestService.getServiceRequest(id)
      setServiceRequest(data)
    } catch (err: any) {
      console.error('Failed to load service request:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'info'
      case 'in_progress':
        return 'warning'
      case 'closed':
        return 'success'
      default:
        return 'default'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'danger'
      case 'medium':
        return 'warning'
      case 'low':
        return 'default'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (!serviceRequest) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Service request not found.</p>
          <Link to="/service-requests">
            <Button className="mt-4">Back to List</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {serviceRequest.request_number}
            </h1>
            <p className="text-gray-600 mt-1">{serviceRequest.title}</p>
          </div>
          <div className="flex space-x-2">
            <Link to="/service-requests">
              <Button variant="outline">Back</Button>
            </Link>
            <Link to={`/service-requests/${serviceRequest.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {serviceRequest.description}
              </p>
            </div>

            {/* Comments Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <CommentsSection serviceRequestId={serviceRequest.id} />
            </div>

            {/* Attachments Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <AttachmentsSection serviceRequestId={serviceRequest.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <Badge variant={getStatusBadgeVariant(serviceRequest.status)}>
                      {serviceRequest.status.replace('_', ' ')}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1">
                    <Badge variant={getPriorityBadgeVariant(serviceRequest.priority)}>
                      {serviceRequest.priority}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Service</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {serviceRequest.service.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {serviceRequest.assigned_to
                      ? `${serviceRequest.assigned_to.first_name} ${serviceRequest.assigned_to.last_name}`
                      : 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {serviceRequest.created_by.first_name} {serviceRequest.created_by.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(serviceRequest.created_at).toLocaleString()}
                  </dd>
                </div>
                {serviceRequest.due_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(serviceRequest.due_date).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {serviceRequest.closed_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Closed Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(serviceRequest.closed_at).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
