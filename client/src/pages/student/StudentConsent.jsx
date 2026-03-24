import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { BottomNav } from '../../components/shared/BottomNav'
import { Card } from '../../components/shared/Card'
import { Modal } from '../../components/shared/Modal'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { formatDate } from '../../utils/helpers'
import { Trash2, MoreVertical } from 'lucide-react'

/**
 * Student consent management page
 */
export default function StudentConsent() {
  const [revokeModal, setRevokeModal] = useState(false)
  const [selectedConsent, setSelectedConsent] = useState(null)

  const { data: consents = [] } = useQuery({
    queryKey: ['student', 'consents'],
    queryFn: async () => {
      const response = await api.get('/students/consents')
      return response.data
    }
  })

  const mockConsents = [
    {
      id: 1,
      scope: 'Academic Records',
      grantedTo: 'Parent/Guardian (Mother)',
      grantedDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'active'
    },
    {
      id: 2,
      scope: 'Attendance Records',
      grantedTo: 'Parent/Guardian (Father)',
      grantedDate: '2024-02-01',
      expiryDate: '2025-02-01',
      status: 'active'
    },
    {
      id: 3,
      scope: 'Documents Access',
      grantedTo: 'School Administration',
      grantedDate: '2023-06-15',
      expiryDate: '2024-06-15',
      status: 'expired'
    }
  ]

  const handleRevoke = async () => {
    try {
      await api.post(`/apaar/consents/${selectedConsent.id}/revoke`)
      setRevokeModal(false)
      setSelectedConsent(null)
      // Refetch consents
    } catch (err) {
      console.error('Failed to revoke consent:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <Header title="Manage Consents" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Box */}
        <Card className="mb-8 bg-primary-50 border-primary-200">
          <p className="text-sm text-primary-900">
            <span className="font-semibold">APAAR Consent Management:</span> Control who can access your educational data. You can revoke consent at any time.
          </p>
        </Card>

        {/* Active Consents */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Consents</h2>
          <div className="space-y-4">
            {mockConsents
              .filter(c => c.status === 'active')
              .map(consent => (
                <Card key={consent.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{consent.scope}</h3>
                        <StatusBadge status={consent.status} type="consent" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Granted to:</span> {consent.grantedTo}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Granted On</p>
                          <p className="font-medium text-gray-900">{formatDate(consent.grantedDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expires On</p>
                          <p className="font-medium text-gray-900">{formatDate(consent.expiryDate)}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedConsent(consent)
                        setRevokeModal(true)
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* Expired/Revoked Consents */}
        {mockConsents.some(c => c.status !== 'active') && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Consent History</h2>
            <div className="space-y-4">
              {mockConsents
                .filter(c => c.status !== 'active')
                .map(consent => (
                  <Card key={consent.id} className="opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{consent.scope}</h3>
                          <StatusBadge status={consent.status} type="consent" />
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Granted to:</span> {consent.grantedTo}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Revoke Confirmation Modal */}
        <Modal
          isOpen={revokeModal}
          onClose={() => {
            setRevokeModal(false)
            setSelectedConsent(null)
          }}
          title="Revoke Consent"
          size="md"
          footer={
            <>
              <button
                onClick={() => {
                  setRevokeModal(false)
                  setSelectedConsent(null)
                }}
                className="btn-outline px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                className="btn-danger px-4 py-2"
              >
                Revoke Consent
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-900">
              Are you sure you want to revoke consent for <span className="font-semibold">{selectedConsent?.scope}</span>?
            </p>
            <p className="text-sm text-gray-600">
              {selectedConsent?.grantedTo} will no longer be able to access this data through APAAR.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-900">
                This action cannot be undone. You can grant consent again anytime.
              </p>
            </div>
          </div>
        </Modal>
      </main>

      <BottomNav />
    </div>
  )
}
