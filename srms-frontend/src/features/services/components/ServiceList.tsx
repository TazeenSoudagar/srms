import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Button } from '../../../components/common/Button'
import { Input } from '../../../components/common/Input'
import { Badge } from '../../../components/common/Badge'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { useAuth } from '../../../contexts/AuthContext'
import type { Service } from '../types'
import { serviceService } from '../../../services/serviceService'

export const ServiceList: React.FC = () => {
    const { user } = useAuth()
    const [search, setSearch] = useState('')
    const [services, setServices] = useState<Service[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const isAdmin = user?.role.name === 'Admin'

    useEffect(() => {
        fetchServices()
    }, [currentPage, search])

    const fetchServices = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await serviceService.getServices({
                page: currentPage,
                per_page: 15,
                search: search || undefined,
            })
            setServices(response.data)
            setTotalPages(response.meta.last_page)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load services')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return

        try {
            await serviceService.deleteService(id)
            setServices(services.filter((s) => s.id !== id))
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete service')
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Services</h1>
                    {isAdmin && (
                        <Link to="/services/new">
                            <Button>Create Service</Button>
                        </Link>
                    )}
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <Input
                        placeholder="Search services by name or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setCurrentPage(1)
                                fetchServices()
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
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            {isAdmin && (
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {services.length === 0 ? (
                                            <tr>
                                                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                                                    No services found.
                                                </td>
                                            </tr>
                                        ) : (
                                            services.map((service) => (
                                                <tr key={service.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {service.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {service.description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge variant={service.is_active ? 'success' : 'default'}>
                                                            {service.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(service.created_at).toLocaleDateString()}
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <Link
                                                                to={`/services/${service.id}/edit`}
                                                                className="text-primary-600 hover:text-primary-900 mr-4 inline-block transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:font-semibold"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(service.id)}
                                                                className="text-red-600 hover:text-red-900 transition-all duration-300 hover:scale-110 hover:font-semibold"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-4">
                            {services.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                                    No services found.
                                </div>
                            ) : (
                                services.map((service) => (
                                    <div key={service.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {service.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                                            </div>
                                            <Badge variant={service.is_active ? 'success' : 'default'}>
                                                {service.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Created:</span>
                                                <span className="text-gray-900">
                                                    {new Date(service.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex space-x-3 pt-2 border-t border-gray-200">
                                                <Link
                                                    to={`/services/${service.id}/edit`}
                                                    className="flex-1 text-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-white hover:bg-primary-600 border border-primary-600 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-md hover:-translate-y-0.5"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="flex-1 px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-md"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
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
