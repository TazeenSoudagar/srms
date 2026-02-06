import { Button } from '../common/Button'
import { Link } from 'react-router-dom'
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="pr-4 py-0">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex-1 items-center">
            <img
              src="/logo.png"
              alt="SRMS Logo"
              className="h-24 w-auto px-0"  
              style={{ transform: 'none' }}
              onError={(e) => {
                // Hide broken image and show text fallback
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) {
                  fallback.style.display = 'block'
                }
              }}
            />
            <span className="text-2xl font-bold text-primary-600" style={{ display: 'none' }}>
              SRMS
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-gray-700">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded">
                  {user.role.name}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
