import React, { useEffect, useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { serviceRequestService } from '../../../services/serviceRequestService'
import { useAuth } from '../../../contexts/AuthContext'
import { PriorityBadge } from '../../../components/common/PriorityBadge'
import { StatusBadge } from '../../../components/common/StatusBadge'
import {
  BarChart3,
  Circle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  CalendarDays,
  FileText,
  AlertTriangle
} from 'lucide-react'
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
      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-1 md:mb-2">{dashboardTitle}</h1>
            <p className="text-xs md:text-sm text-slate-600">Overview of your service requests and system activity</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Total Requests */}
          <Link
            to="/service-requests"
            className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm transition-colors hover:bg-slate-50 block"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md bg-slate-100">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600 truncate">{totalLabel}</p>
            <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{stats.total}</p>
          </Link>

          {/* Open */}
          <Link
            to="/service-requests?status=open"
            className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm transition-colors hover:bg-slate-50 block"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md bg-slate-100">
                <Circle className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600">Open</p>
            <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{stats.open}</p>
          </Link>

          {/* In Progress */}
          <Link
            to="/service-requests?status=in_progress"
            className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm transition-colors hover:bg-slate-50 block"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md bg-slate-100">
                <RefreshCw className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600">In Progress</p>
            <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{stats.inProgress}</p>
          </Link>

          {/* Closed */}
          <Link
            to="/service-requests?status=closed"
            className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm transition-colors hover:bg-slate-50 block"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md bg-slate-100">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600">Closed</p>
            <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{stats.closed}</p>
          </Link>

          {/* High Priority */}
          <Link
            to="/service-requests?priority=high"
            className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm transition-colors hover:bg-slate-50 block"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md bg-slate-100">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600 truncate">High Priority</p>
            <p className={`mt-1 md:mt-2 text-2xl md:text-3xl font-bold tracking-tight ${stats.highPriority > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stats.highPriority}</p>
          </Link>

          {/* Overdue */}
          <Link
            to="/service-requests"
            className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm transition-colors hover:bg-slate-50 block"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md bg-slate-100">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600">Overdue</p>
            <p className={`mt-1 md:mt-2 text-2xl md:text-3xl font-bold tracking-tight ${stats.overdue > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stats.overdue}</p>
          </Link>

          {/* Due Within 7 Days */}
          <Link
            to="/service-requests"
            className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm transition-colors hover:bg-slate-50 block"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md bg-slate-100">
                <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600 truncate">Due Within 7 Days</p>
            <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{stats.dueWithin7Days}</p>
          </Link>
        </div>

        {error && <ErrorMessage message={error} />}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          /* Service Requests Table */
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                {isSupportEngineer ? 'Recent Assigned Requests' : 'Recent Service Requests'}
              </h2>
              <p className="mt-1 text-xs md:text-sm text-slate-500">
                A list of your most recent service requests
              </p>
            </div>
            <div className="p-4 md:p-6">
              {recentRequests.length === 0 ? (
                <div className="px-4 md:px-6 py-10 md:py-14 text-center">
                  <FileText className="mx-auto h-10 w-10 md:h-12 md:w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">
                    {isSupportEngineer ? 'No assigned requests' : 'No service requests'}
                  </h3>
                  <p className="mt-1 text-xs md:text-sm text-slate-500">
                    {isSupportEngineer
                      ? 'You have no assigned requests at the moment'
                      : 'Get started by creating a new service request'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((request) => (
                    <Link
                      key={request.id}
                      to={`/service-requests/${request.id}`}
                      className="block p-3 md:p-5 border border-slate-200 rounded-lg transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-sm md:text-base text-slate-900 break-words">{request.title}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={request.status} />
                              <PriorityBadge priority={request.priority} />
                            </div>
                          </div>
                          <p className="text-xs md:text-sm text-slate-500 font-mono mb-2">{request.request_number}</p>
                          {request.due_date && (
                            <div className="flex items-center gap-2 text-xs md:text-sm flex-wrap">
                              <span className="text-slate-600">
                                Due: {new Date(request.due_date).toLocaleDateString()}
                              </span>
                              {new Date(request.due_date) < new Date() && request.status !== 'closed' && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  Overdue
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xs md:text-sm text-slate-400 whitespace-nowrap">
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
