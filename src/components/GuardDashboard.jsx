import { useState } from 'react'
import { useEntries } from '../hooks/useEntries'
import ForcedEntryModal from './ForcedEntryModal'

const GuardDashboard = () => {
  const [showForcedEntryModal, setShowForcedEntryModal] = useState(false)
  const { entries } = useEntries()

  // ✅ Get entries for "today" (ikut tarikh sebenar Malaysia)
  const todayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp).toLocaleDateString('ms-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
    })
    const todayDate = new Date().toLocaleDateString('ms-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
    })
    return entryDate === todayDate
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Guard Dashboard</h2>
            <p className="text-gray-600">
              Monitor entries and record forced access incidents
            </p>
          </div>

          <button
            onClick={() => setShowForcedEntryModal(true)}
            className="btn-primary flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>Report Forced Entry</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {todayEntries.length}
          </div>
          <div className="text-gray-600">Entries Today</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {todayEntries.filter(e => e.entry_type === 'normal').length}
          </div>
          <div className="text-gray-600">Normal Entries</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {todayEntries.filter(e => e.entry_type === 'forced_by_guard').length}
          </div>
          <div className="text-gray-600">Forced Entries</div>
        </div>
      </div>

      {/* Forced Entry Modal */}
      <ForcedEntryModal
        isOpen={showForcedEntryModal}
        onClose={() => setShowForcedEntryModal(false)}
      />
    </div>
  )
}

export default GuardDashboard
