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
          {/* Total Requests - Rolling counter effect with 3D rotation */}
          <Link
            to="/service-requests"
            className="bg-white p-6 rounded-lg shadow cursor-pointer transition-all duration-500 hover:[animation:totalPulse_1s_ease-in-out_infinite] group relative overflow-hidden block"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 group-hover:[animation:shimmer_2s_ease-in-out_infinite]"
                 style={{ backgroundSize: '200% 100%' }}></div>
            <h3 className="text-sm font-medium text-gray-500 relative z-10">Total Requests</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2 relative z-10 group-hover:[animation:countUp_0.5s_ease-out]">{stats.total}</p>
          </Link>

          {/* Open - Waiting/Pending animation with pulse rings */}
          <Link
            to="/service-requests?status=open"
            className="bg-white p-6 rounded-lg shadow cursor-pointer transition-all duration-300 hover:[animation:waiting_2s_ease-in-out_infinite] group relative overflow-hidden block"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:[animation:pulse-ring_2s_ease-out_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:[animation:pulse-ring_2s_ease-out_infinite_0.5s]"></div>
            <h3 className="text-sm font-medium text-gray-500 relative z-10">Open</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2 relative z-10">
              {stats.open}
              <span className="ml-2 text-sm font-normal text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">waiting...</span>
            </p>
          </Link>

          {/* In Progress - Horizontal sliding with progress bar */}
          <Link
            to="/service-requests?status=in_progress"
            className="bg-white p-6 rounded-lg shadow cursor-pointer transition-all duration-300 hover:[animation:progress_2s_ease-in-out_infinite] group relative overflow-hidden block"
          >
            <div className="absolute bottom-0 left-0 h-1 bg-yellow-400 opacity-0 group-hover:opacity-100 group-hover:[animation:progressBar_2s_ease-in-out_infinite]"></div>
            <h3 className="text-sm font-medium text-gray-500 relative z-10">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2 relative z-10 flex items-center gap-2">
              {stats.inProgress}
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">⚡ working...</span>
            </p>
          </Link>

          {/* Closed - Celebration with confetti effect */}
          <Link
            to="/service-requests?status=closed"
            className="bg-white p-6 rounded-lg shadow cursor-pointer transition-all duration-300 hover:[animation:celebrate_0.8s_ease-in-out_infinite] group relative overflow-hidden block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-transparent to-green-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-2 right-2 text-2xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce">🎉</div>
            <div className="absolute bottom-2 left-2 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce delay-100">✨</div>
            <div className="absolute top-1/2 right-4 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce delay-200">🎊</div>
            <h3 className="text-sm font-medium text-gray-500 relative z-10">Closed</h3>
            <p className="text-3xl font-bold text-green-600 mt-2 relative z-10 flex items-center gap-2">
              {stats.closed}
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">✓ done!</span>
            </p>
          </Link>
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
