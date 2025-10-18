import { useState } from 'react'
import { useEntries } from '../hooks/useEntries'
import ForcedEntryModal from './ForcedEntryModal'
import EntryTable from './EntryTable'

const GuardDashboard = () => {
  const [showForcedEntryModal, setShowForcedEntryModal] = useState(false)
  const { entries, loading } = useEntries()

  // Get recent entries (last 24 hours)
  const recentEntries = entries.filter(entry => {
    const entryTime = new Date(entry.timestamp)
    const now = new Date()
    const hoursDiff = (now - entryTime) / (1000 * 60 * 60)
    return hoursDiff <= 24
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Guard Dashboard</h2>
            <p className="text-gray-600">Monitor entries and record forced access incidents</p>
          </div>
          
          <button
            onClick={() => setShowForcedEntryModal(true)}
            className="btn-primary flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Report Forced Entry</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {recentEntries.length}
          </div>
          <div className="text-gray-600">Entries Today</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {recentEntries.filter(e => e.entry_type === 'normal').length}
          </div>
          <div className="text-gray-600">Normal Entries</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {recentEntries.filter(e => e.entry_type === 'forced_by_guard').length}
          </div>
          <div className="text-gray-600">Forced Entries</div>
        </div>
      </div>

      {/* Recent Entries */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Entries (Last 24 Hours)</h3>
        <EntryTable entries={recentEntries} loading={loading} />
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
