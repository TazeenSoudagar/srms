import React, { useState, useEffect } from 'react';
import { Layout } from '../../../components/layout/Layout';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Badge } from '../../../components/common/Badge';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import type { ActivityLog, ActivityLogFilters } from '../types';
import { getActivityLogs } from '../services/activityLogService';

export const ActivityLogList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('today');
  const [modelFilter, setModelFilter] = useState<'ServiceRequest' | 'User' | 'Comment' | 'Service' | ''>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivityLogs();
  }, [currentPage, dateFilter, modelFilter, roleFilter, actionFilter, search]);

  const fetchActivityLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: ActivityLogFilters = {
        per_page: 20,
        date_filter: dateFilter,
      };

      if (modelFilter) filters.loggable_type = modelFilter;
      if (roleFilter) filters.role_id = roleFilter;
      if (actionFilter) filters.action = actionFilter;
      if (search) filters.search = search;

      const response = await getActivityLogs(filters);
      setActivityLogs(response.data);
      setTotalPages(response.last_page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'deleted':
        return 'danger';
      case 'assigned':
        return 'warning';
      case 'status_changed':
        return 'info';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatModelType = (type: string): string => {
    const parts = type.split('\\');
    return parts[parts.length - 1];
  };

  const formatDetails = (details: Record<string, unknown> | null): string => {
    if (!details) return 'N/A';

    const entries = Object.entries(details);
    if (entries.length === 0) return 'N/A';

    return entries
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const clearFilters = () => {
    setSearch('');
    setDateFilter('today');
    setModelFilter('');
    setRoleFilter('');
    setActionFilter('');
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activity Logs</h1>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Date Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>

            {/* Model/Entity Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value as any)}
            >
              <option value="">All Models</option>
              <option value="ServiceRequest">Service Requests</option>
              <option value="User">Users</option>
              <option value="Comment">Comments</option>
              <option value="Service">Services</option>
            </select>

            {/* Action Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="assigned">Assigned</option>
              <option value="status_changed">Status Changed</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters}>
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
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activityLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No activity logs found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      activityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                            <div className="text-sm text-gray-500">{log.user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.user.role || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getActionBadgeVariant(log.action)}>
                              {log.action.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatModelType(log.loggable_type)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {formatDetails(log.details)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{new Date(log.created_at).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </div>
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
              {activityLogs.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  No activity logs found for the selected filters.
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                        <div className="text-xs text-gray-500">{log.user.email}</div>
                      </div>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Role:</span>
                        <span className="ml-1 text-gray-900">{log.user.role || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Model:</span>
                        <span className="ml-1 text-gray-900">
                          {formatModelType(log.loggable_type)}
                        </span>
                      </div>
                    </div>

                    {log.details && (
                      <div className="text-sm">
                        <span className="text-gray-500">Details:</span>
                        <div className="mt-1 text-gray-900 text-xs">
                          {formatDetails(log.details)}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      {new Date(log.created_at).toLocaleDateString()} at{' '}
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
