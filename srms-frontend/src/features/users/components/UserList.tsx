import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Button } from '../../../components/common/Button'
import { Input } from '../../../components/common/Input'
import { Badge } from '../../../components/common/Badge'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import type { User } from '../types'
import { userService } from '../../../services/userService'

export const UserList: React.FC = () => {
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const roles = [
        { id: '1', name: 'Admin' },
        { id: '2', name: 'Support Engineer' },
        { id: '3', name: 'Client' },
    ]

    useEffect(() => {
        fetchUsers()
    }, [currentPage, search, roleFilter])

    const fetchUsers = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await userService.getUsers({
                page: currentPage,
                per_page: 15,
                search: search || undefined,
                role_id: roleFilter || undefined,
            })
            setUsers(response.data)
            setTotalPages(response.meta.last_page)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load users')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        try {
            await userService.deleteUser(id)
            setUsers(users.filter((u) => u.id !== id))
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user')
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                    <Link to="/users/new">
                        <Button>Create User</Button>
                    </Link>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-4 rounded-lg shadow space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Search users by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setCurrentPage(1)
                                    fetchUsers()
                                }
                            }}
                        />
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All Roles</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
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
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Phone
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
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
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                    No users found.
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.phone}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge variant="default">{user.role.name}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge variant={user.is_active ? 'success' : 'default'}>
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Link
                                                            to={`/users/${user.id}/edit`}
                                                            className="text-primary-600 hover:text-primary-900 mr-4 inline-block transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:font-semibold"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="text-red-600 hover:text-red-900 transition-all duration-300 hover:scale-110 hover:font-semibold"
                                                        >
                                                            Delete
                                                        </button>
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
                            {users.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                                    No users found.
                                </div>
                            ) : (
                                users.map((user) => (
                                    <div key={user.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {user.first_name} {user.last_name}
                                                </h3>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                            <Badge variant={user.is_active ? 'success' : 'default'}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Phone:</span>
                                                <span className="text-gray-900">{user.phone}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Role:</span>
                                                <Badge variant="default">{user.role.name}</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Created:</span>
                                                <span className="text-gray-900">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3 pt-2 border-t border-gray-200">
                                            <Link
                                                to={`/users/${user.id}/edit`}
                                                className="flex-1 text-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-white hover:bg-primary-600 border border-primary-600 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-md hover:-translate-y-0.5"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="flex-1 px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-md"
                                            >
                                                Delete
                                            </button>
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
