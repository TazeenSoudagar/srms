import React from 'react'

interface SuccessMessageProps {
  message: string
  className?: string
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  className = '',
}) => {
  return (
    <div
      className={`bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md ${className}`}
    >
      <p className="text-sm">{message}</p>
    </div>
  )
}
