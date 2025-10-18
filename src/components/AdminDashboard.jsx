import { useState, useEffect } from 'react'
import { useEntries } from '../hooks/useEntries'
import EntryTable from './EntryTable'

const AdminDashboard = () => {
  const { entries, loading } = useEntries()
  const [stats, setStats] = useState({
    totalEntries: 0,
    todayEntries: 0,
    visitors: 0,
    residents: 0,
    forcedEntries: 0
  })

  useEffect(() => {
    if (entries.length > 0) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      const todayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp)
        return entryDate >= today
      })

      setStats({
        totalEntries: entries.length,
        todayEntries: todayEntries.length,
        visitors: entries.filter(e => e.users?.user_type === 'visitor').length,
        residents: entries.filter(e => e.users?.user_type === 'resident_unpaid').length,
        forcedEntries: entries.filter(e => e.entry_type === 'forced_by_guard').length
      })
    }
  }, [entries])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">Monitor all entry activity and system statistics</p>
          </div>
          
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {stats.totalEntries}
          </div>
          <div className="text-gray-600">Total Entries</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.todayEntries}
          </div>
          <div className="text-gray-600">Today's Entries</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.visitors}
          </div>
          <div className="text-gray-600">Visitors</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.residents}
          </div>
          <div className="text-gray-600">Residents</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {stats.forcedEntries}
          </div>
          <div className="text-gray-600">Forced Entries</div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">System Status: Online</span>
        </div>
        <p className="text-sm text-gray-600">
          Real-time monitoring is active. New entries will appear automatically.
        </p>
      </div>

      {/* All Entries Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Entry Records</h3>
        <EntryTable entries={entries} loading={loading} />
      </div>
    </div>
  )
}

export default AdminDashboard
