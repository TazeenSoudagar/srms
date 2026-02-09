import React from 'react'

interface StatusBadgeProps {
  status: 'open' | 'in_progress' | 'closed'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyles = () => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLabel = () => {
    switch (status) {
      case 'in_progress':
        return 'In Progress'
      case 'open':
        return 'Open'
      case 'closed':
        return 'Closed'
      default:
        return status
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()} ${className}`}
    >
      {getLabel()}
    </span>
  )
}
