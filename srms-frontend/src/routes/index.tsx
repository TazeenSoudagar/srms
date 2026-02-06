import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

import { LoginForm } from '../features/auth/components/LoginForm'

const LoginPage = () => <LoginForm />
import { Dashboard } from '../features/serviceRequests/components/Dashboard'

const DashboardPage = () => <Dashboard />
import { ServiceRequestList } from '../features/serviceRequests/components/ServiceRequestList'
import { ServiceRequestDetail } from '../features/serviceRequests/components/ServiceRequestDetail'
import { ServiceRequestForm } from '../features/serviceRequests/components/ServiceRequestForm'

const ServiceRequestListPage = () => <ServiceRequestList />
const ServiceRequestDetailPage = () => <ServiceRequestDetail />
const ServiceRequestFormPage = () => <ServiceRequestForm />
const ServiceRequestEditPage = () => <ServiceRequestForm isEdit />
import { UserList } from '../features/users/components/UserList'
import { UserForm } from '../features/users/components/UserForm'

const UserListPage = () => <UserList />
const UserFormPage = () => <UserForm />
const UserEditPage = () => <UserForm isEdit />
import { ServiceList } from '../features/services/components/ServiceList'
import { ServiceForm } from '../features/services/components/ServiceForm'

const ServiceListPage = () => <ServiceList />
const ServiceFormPage = () => <ServiceForm />
const ServiceEditPage = () => <ServiceForm isEdit />
import { ActivityLogList } from '../features/activityLogs/components/ActivityLogList'

const ActivityLogListPage = () => <ActivityLogList />

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests"
        element={
          <ProtectedRoute>
            <ServiceRequestListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests/new"
        element={
          <ProtectedRoute>
            <ServiceRequestFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests/:id"
        element={
          <ProtectedRoute>
            <ServiceRequestDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests/:id/edit"
        element={
          <ProtectedRoute>
            <ServiceRequestEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRole="Admin">
            <UserListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute requiredRole="Admin">
            <UserFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute requiredRole="Admin">
            <UserEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <ServiceListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services/new"
        element={
          <ProtectedRoute requiredRole="Admin">
            <ServiceFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services/:id/edit"
        element={
          <ProtectedRoute requiredRole="Admin">
            <ServiceEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity-logs"
        element={
          <ProtectedRoute requiredRole="Admin">
            <ActivityLogListPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
