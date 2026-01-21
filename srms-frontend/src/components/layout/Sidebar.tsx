import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface NavItem {
  label: string
  path: string
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Service Requests', path: '/service-requests' },
  { label: 'Users', path: '/users', roles: ['Admin'] },
]

export const Sidebar: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(user?.role.name || '')
  })

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
