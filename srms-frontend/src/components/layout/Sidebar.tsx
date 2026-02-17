import React from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { X } from 'lucide-react'

interface NavItem {
  label: string
  path: string
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Users', path: '/users', roles: ['Admin'] },
  { label: 'Services', path: '/services' },
  { label: 'Service Requests', path: '/service-requests' },
  { label: 'Activity Logs', path: '/activity-logs', roles: ['Admin'] },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth()
  const location = useLocation()

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(user?.role.name || '')
  })

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200 min-h-screen">
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-400'}`}></span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar - Portal with backdrop */}
      {createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 lg:hidden ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Mobile Sidebar */}
          <aside
            className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 z-40 lg:hidden ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="text-lg font-bold text-slate-900">Menu</span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-4 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-400'}`}></span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>
        </>,
        document.body
      )}
    </>
  )
}
