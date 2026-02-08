import { Link } from 'react-router-dom'
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Avatar } from '../common/Avatar'
import { ProfileSidebar } from '../../features/profile/components/ProfileSidebar'

export const Header: React.FC = () => {
  const { user } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

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
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{user.role.name}</p>
                </div>
                <Avatar
                  src={user.avatar?.url}
                  alt={`${user.first_name} ${user.last_name}`}
                  size="md"
                  onClick={() => setIsProfileOpen(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Sidebar */}
      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  )
}
