import React from 'react'
import { Circle, RefreshCw, CheckCircle2 } from 'lucide-react'

interface StatusBadgeProps {
  status: 'open' | 'in_progress' | 'closed'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyles = () => {
    switch (status) {
      case 'open':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'open':
        return <Circle className="h-3 w-3" />
      case 'in_progress':
        return <RefreshCw className="h-3 w-3" />
      case 'closed':
        return <CheckCircle2 className="h-3 w-3" />
      default:
        return null
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
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium ${getStyles()} ${className}`}
    >
      {getIcon()}
      {getLabel()}
    </span>
  )
}
