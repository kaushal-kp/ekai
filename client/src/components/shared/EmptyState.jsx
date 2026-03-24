import React from 'react'

/**
 * Empty state component
 */
export const EmptyState = ({ icon: Icon, title, description, action = null }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && <Icon className="h-16 w-16 text-gray-300 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-center max-w-sm mb-4">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
