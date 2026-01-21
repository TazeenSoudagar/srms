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
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchUsers()
    }, [currentPage, search])

    const fetchUsers = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await userService.getUsers({
                page: currentPage,
                per_page: 15,
                search: search || undefined,
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

                {/* Search */}
                <div className="bg-white p-4 rounded-lg shadow">
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
                </div>

                {error && <ErrorMessage message={error} />}

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                                            className="text-primary-600 hover:text-primary-900 mr-4"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="text-red-600 hover:text-red-900"
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
