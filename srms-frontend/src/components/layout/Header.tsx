import { Link } from 'react-router-dom'
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Avatar } from '../common/Avatar'
import { ProfileSidebar } from '../../features/profile/components/ProfileSidebar'
import { Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-3 group">
              {/* Logo - TODO: Add dark mode support with logo-dark.png */}
              <img
                src="/logo-1.png"
                alt="SRMS Logo"
                className="h-12 w-auto shrink-0"
              />
              <span className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                Service Hub
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {user && (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-slate-500">{user.role.name}</p>
                </div>
                <Avatar
                  src={user.avatar?.url}
                  alt={`${user.first_name} ${user.last_name}`}
                  size="md"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Sidebar */}
      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  )
}
