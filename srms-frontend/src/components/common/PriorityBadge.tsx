import React from 'react'
import { ArrowUp, Minus, ArrowDown } from 'lucide-react'

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high'
  className?: string
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getStyles = () => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'low':
        return 'bg-slate-50 text-slate-700 border-slate-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getIcon = () => {
    switch (priority) {
      case 'high':
        return <ArrowUp className="h-3 w-3" />
      case 'medium':
        return <Minus className="h-3 w-3" />
      case 'low':
        return <ArrowDown className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${getStyles()} ${className}`}
    >
      {getIcon()}
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}
