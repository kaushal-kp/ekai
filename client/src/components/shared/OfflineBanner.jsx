import React from 'react'
import { WifiOff, Loader } from 'lucide-react'
import { useOffline } from '../../hooks/useOffline'

/**
 * Banner shown when offline with sync status
 */
export const OfflineBanner = ({ pendingCount = 0 }) => {
  const { isOffline } = useOffline()

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 px-4 py-3 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900">You are offline</p>
            {pendingCount > 0 && (
              <p className="text-xs text-amber-700">{pendingCount} changes pending sync</p>
            )}
          </div>
        </div>
        <Loader className="h-4 w-4 text-amber-600 animate-spin" />
      </div>
    </div>
  )
}
