import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Button } from '../../../components/common/Button'
import { Input } from '../../../components/common/Input'
import { Badge } from '../../../components/common/Badge'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import type { ServiceRequest } from '../types'
import { serviceRequestService } from '../../../services/serviceRequestService'

export const ServiceRequestList: React.FC = () => {
  const [searchParams] = useSearchParams()
  const statusFromUrl = searchParams.get('status') || 'all'

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(statusFromUrl)
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const statusFromUrl = searchParams.get('status') || 'all'
    setStatusFilter(statusFromUrl)
  }, [searchParams])

  useEffect(() => {
    fetchServiceRequests()
  }, [currentPage, statusFilter, priorityFilter, search])

  const fetchServiceRequests = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filters: any = {
        page: currentPage,
        per_page: 15,
      }
      if (statusFilter !== 'all') filters.status = statusFilter
      if (priorityFilter !== 'all') filters.priority = priorityFilter
      if (search) filters.search = search

      const response = await serviceRequestService.getServiceRequests(filters)
      setServiceRequests(response.data)
      setTotalPages(response.meta.last_page)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load service requests')
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

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Service Requests</h1>
          <Link to="/service-requests/new">
            <Button>Create Request</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setPriorityFilter('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {serviceRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          No service requests found. Create your first request to get started.
                        </td>
                      </tr>
                    ) : (
                      serviceRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.request_number}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{request.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.service.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusBadgeVariant(request.status)}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getPriorityBadgeVariant(request.priority)}>
                              {request.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.assigned_to
                              ? `${request.assigned_to.first_name} ${request.assigned_to.last_name}`
                              : 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/service-requests/${request.id}`}
                              className="text-primary-600 hover:text-primary-900 inline-block transition-all duration-300 hover:scale-125 hover:-translate-y-0.5 hover:font-semibold hover:underline hover:decoration-wavy"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {serviceRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  No service requests found. Create your first request to get started.
                </div>
              ) : (
                serviceRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">
                            {request.request_number}
                          </span>
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {request.title}
                        </h3>
                      </div>
                      <Badge variant={getPriorityBadgeVariant(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Service:</span>
                        <span className="text-gray-900">{request.service.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Assigned To:</span>
                        <span className="text-gray-900">
                          {request.assigned_to
                            ? `${request.assigned_to.first_name} ${request.assigned_to.last_name}`
                            : 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <Link
                        to={`/service-requests/${request.id}`}
                        className="block w-full text-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-white hover:bg-primary-600 border border-primary-600 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 active:scale-95"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
