import { useState } from 'react'
import { exportToCSV } from '../utils/api'

const EntryTable = ({ entries, loading }) => {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEntries = entries.filter(entry => {
    const matchesFilter = filter === 'all' || 
      (filter === 'visitor' && entry.users?.user_type === 'visitor') ||
      (filter === 'resident' && entry.users?.user_type === 'resident_unpaid') ||
      (filter === 'forced' && entry.entry_type === 'forced_by_guard')
    
    const matchesSearch = searchTerm === '' ||
      entry.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.users?.house_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const handleExport = () => {
    exportToCSV(filteredEntries)
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getEntryTypeBadge = (entry) => {
    if (entry.entry_type === 'forced_by_guard') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Forced Entry</span>
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Normal</span>
  }

  const getUserTypeBadge = (userType) => {
    if (userType === 'visitor') {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Visitor</span>
    }
    return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Resident</span>
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header with filters and export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Entry Records</h3>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field sm:w-64"
          />
          
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field sm:w-40"
          >
            <option value="all">All Entries</option>
            <option value="visitor">Visitors</option>
            <option value="resident">Residents</option>
            <option value="forced">Forced Entries</option>
          </select>
          
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entry Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No entries found
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {entry.users?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.users?.house_number || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUserTypeBadge(entry.users?.user_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEntryTypeBadge(entry)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(entry.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.selfie_url ? (
                      <img
                        src={entry.selfie_url}
                        alt="Entry photo"
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75"
                        onClick={() => window.open(entry.selfie_url, '_blank')}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No photo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {entry.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredEntries.length} of {entries.length} entries
      </div>
    </div>
  )
}

export default EntryTable
