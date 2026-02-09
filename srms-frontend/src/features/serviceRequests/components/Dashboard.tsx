import React, { useEffect, useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { serviceRequestService } from '../../../services/serviceRequestService'
import { useAuth } from '../../../contexts/AuthContext'
import { PriorityBadge } from '../../../components/common/PriorityBadge'
import { StatusBadge } from '../../../components/common/StatusBadge'
import type { ServiceRequest } from '../types'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    highPriority: 0,
    overdue: 0,
    dueWithin7Days: 0,
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
      // Fetch stats from dedicated endpoint
      const statsData = await serviceRequestService.getDashboardStats()
      setStats({
        total: statsData.total,
        open: statsData.open,
        inProgress: statsData.in_progress,
        closed: statsData.closed,
        highPriority: statsData.high_priority,
        overdue: statsData.overdue,
        dueWithin7Days: statsData.due_within_7_days,
      })

      // Fetch recent requests
      const response = await serviceRequestService.getServiceRequests({
        page: 1,
        per_page: 10,
      })
      setRecentRequests(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const isSupportEngineer = user?.role?.name?.toLowerCase() === 'support engineer'
  const dashboardTitle = isSupportEngineer ? 'Dashboard - Support Engineer' : 'Dashboard'
  const totalLabel = isSupportEngineer ? 'Assigned Requests' : 'Total Requests'

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{dashboardTitle}</h1>
          {/* <Link to="/service-requests/new">
            <Button>Create Service Request</Button>
          </Link> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Requests - Rolling counter effect with 3D rotation */}
          <Link
            to="/service-requests"
            className="bg-white p-6 rounded-lg shadow cursor-pointer transition-all duration-500 hover:[animation:totalPulse_1s_ease-in-out_infinite] group relative overflow-hidden block"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 group-hover:[animation:shimmer_2s_ease-in-out_infinite]"
                 style={{ backgroundSize: '200% 100%' }}></div>
            <h3 className="text-sm font-medium text-gray-500 relative z-10">{totalLabel}</h3>
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

          {/* High Priority - Urgent with red pulse */}
          <Link
            to="/service-requests?priority=high"
            className="bg-white p-6 rounded-lg shadow cursor-pointer transition-all duration-300 hover:shadow-lg group relative overflow-hidden block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-transparent to-red-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-2 right-2 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-pulse">🔴</div>
            <h3 className="text-sm font-medium text-gray-500 relative z-10">High Priority</h3>
            <p className="text-3xl font-bold text-red-600 mt-2 relative z-10 flex items-center gap-2">
              {stats.highPriority}
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">⚠️ urgent</span>
            </p>
          </Link>

          {/* Overdue - Alert with warning */}
          <Link
            to="/service-requests"
            className="bg-white p-6 rounded-lg shadow cursor-pointer transition-all duration-300 hover:shadow-lg group relative overflow-hidden block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-2 right-2 text-xl opacity-0 group-hover:opacity-100 group-hover:animate-bounce">⏰</div>
            <h3 className="text-sm font-medium text-gray-500 relative z-10">Overdue</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2 relative z-10 flex items-center gap-2">
              {stats.overdue}
              {stats.overdue > 0 && <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">⚠️ late!</span>}
            </p>
          </Link>

          {/* Due Within 7 Days - Upcoming deadline */}
          <Link
            to="/service-requests"
            className="bg-white p-6 rounded-lg shadow cursor-pointer transition-all duration-300 hover:shadow-lg group relative overflow-hidden block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-2 right-2 text-xl opacity-0 group-hover:opacity-100">📅</div>
            <h3 className="text-sm font-medium text-gray-500 relative z-10">Due Within 7 Days</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2 relative z-10 flex items-center gap-2">
              {stats.dueWithin7Days}
              {stats.dueWithin7Days > 0 && <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">📌 soon</span>}
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
              <h2 className="text-lg font-semibold text-gray-900">
                {isSupportEngineer ? 'Recent Assigned Requests' : 'Recent Service Requests'}
              </h2>
            </div>
            <div className="p-6">
              {recentRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {isSupportEngineer
                    ? 'No assigned requests yet.'
                    : 'No service requests yet. Create your first request to get started.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {recentRequests.map((request) => (
                    <Link
                      key={request.id}
                      to={`/service-requests/${request.id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{request.title}</h3>
                            <PriorityBadge priority={request.priority} />
                            <StatusBadge status={request.status} />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">{request.request_number}</p>
                          {request.due_date && (
                            <p className="text-sm text-gray-600">
                              Due: {new Date(request.due_date).toLocaleDateString()}
                              {new Date(request.due_date) < new Date() && request.status !== 'closed' && (
                                <span className="ml-2 text-red-600 font-medium">⚠️ Overdue</span>
                              )}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 ml-4">
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
