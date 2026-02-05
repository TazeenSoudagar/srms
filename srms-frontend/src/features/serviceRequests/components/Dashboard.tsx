import React, { useEffect, useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { serviceRequestService } from '../../../services/serviceRequestService'
import type { ServiceRequest } from '../types'

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
  })
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await serviceRequestService.getServiceRequests({
        page: 1,
        per_page: 10,
      })
      setRecentRequests(response.data)

      // Calculate stats
      const allResponse = await serviceRequestService.getServiceRequests({ per_page: 100 })
      const all = allResponse.data
      setStats({
        total: all.length,
        open: all.filter((r) => r.status === 'open').length,
        inProgress: all.filter((r) => r.status === 'in_progress').length,
        closed: all.filter((r) => r.status === 'closed').length,
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {/* <Link to="/service-requests/new">
            <Button>Create Service Request</Button>
          </Link> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Open</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.open}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Closed</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.closed}</p>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          /* Service Requests Table */
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Service Requests</h2>
            </div>
            <div className="p-6">
              {recentRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No service requests yet. Create your first request to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentRequests.map((request) => (
                    <Link
                      key={request.id}
                      to={`/service-requests/${request.id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{request.title}</h3>
                          <p className="text-sm text-gray-500">{request.request_number}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
