import React from 'react'

interface ErrorMessageProps {
  message: string
  className?: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = '',
}) => {
  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md ${className}`}
    >
      <p className="text-sm">{message}</p>
    </div>
  )
}
