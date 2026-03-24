import React from 'react'

/**
 * Reusable card component
 */
export const Card = ({ children, variant = 'default', className = '', onClick = null, ...props }) => {
  const baseClasses = 'rounded-lg bg-white border border-gray-200 shadow-sm'

  const variantClasses = {
    default: 'p-6',
    stat: 'p-4',
    action: 'p-4 hover:shadow-md transition-shadow cursor-pointer'
  }

  const containerClass = `${baseClasses} ${variantClasses[variant]} ${className}`

  return (
    <div className={containerClass} onClick={onClick} {...props}>
      {children}
    </div>
  )
}
