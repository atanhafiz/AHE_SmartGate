import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../hooks/useSession'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    entryType: 'all'
  })
  const { profile, signOut } = useSession()

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Gagal keluar. Cuba semula.')
    }
  }

  // Fetch entries from Supabase
  const fetchEntries = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('entries')
        .select('id, entry_type, selfie_url, timestamp, notes, user_id')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }
      
      // Ensure data is an array and handle null/undefined cases
      const safeData = Array.isArray(data) ? data : []
      setEntries(safeData)
      setFilteredEntries(safeData)
      console.log('✅ AdminDashboard loaded successfully:', safeData.length, 'entries')
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error('Gagal memuat rekod. Cuba semula.')
      // Set empty arrays on error to prevent crashes
      setEntries([])
      setFilteredEntries([])
    } finally {
      setLoading(false)
    }
  }

  // Set up realtime subscription
  useEffect(() => {
    fetchEntries()

    // Subscribe to realtime changes with error handling
    let subscription
    try {
      subscription = supabase
        .channel('entries_changes')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'entries' 
          },
          (payload) => {
            console.log('New entry received:', payload)
            toast.success('🚪 Rekod baru diterima')
            
            // Fetch the new entry with user data
            supabase
              .from('entries')
              .select(`
                id,
                entry_type,
                selfie_url,
                notes,
                timestamp,
                users (
                  name,
                  user_type,
                  house_number
                )
              `)
              .eq('id', payload.new.id)
              .single()
              .then(({ data, error }) => {
                if (data && !error) {
                  setEntries(prev => [data, ...prev])
                  setFilteredEntries(prev => [data, ...prev])
                } else {
                  console.error('Error fetching new entry:', error)
                }
              })
              .catch(err => {
                console.error('Error in realtime handler:', err)
              })
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
        })
    } catch (error) {
      console.error('Error setting up realtime subscription:', error)
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...entries]

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp)
        const startDate = new Date(filters.startDate)
        return entryDate >= startDate
      })
    }

    if (filters.endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp)
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999) // End of day
        return entryDate <= endDate
      })
    }

    // Filter by entry type
    if (filters.entryType !== 'all') {
      filtered = filtered.filter(entry => entry.entry_type === filters.entryType)
    }

    setFilteredEntries(filtered)
  }, [entries, filters])

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      entryType: 'all'
    })
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get entry type badge
  const getEntryTypeBadge = (entryType) => {
    if (entryType === 'forced_by_guard') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          🔴 Forced
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✅ Normal
      </span>
    )
  }

  // Open image modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl)
  }

  // Close image modal
  const closeImageModal = () => {
    setSelectedImage(null)
  }

  return (
    <div className="bg-sky-50 min-h-screen p-4">
      <div className="bg-white shadow-xl rounded-xl p-6 max-w-7xl mx-auto">
        {/* Header with logout button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-sky-700">
            AHE SmartGate Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Keluar
          </button>
        </div>
        
        {/* User info */}
        <div className="text-sm text-gray-600 mb-4 text-center">
          Logged in as: {profile?.full_name || 'Admin'} ({profile?.role || 'admin'})
        </div>

        {/* Filter Controls */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarikh Mula
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarikh Akhir
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Entry Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Masuk
              </label>
              <select
                value={filters.entryType}
                onChange={(e) => handleFilterChange('entryType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">Semua</option>
                <option value="normal">Normal</option>
                <option value="forced_by_guard">Forced</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-md px-3 py-2 text-sm font-medium"
              >
                🗑️ Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredEntries.length}
            </div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredEntries.filter(e => e.entry_type === 'normal').length}
            </div>
            <div className="text-sm text-gray-600">Normal Entries</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredEntries.filter(e => e.entry_type === 'forced_by_guard').length}
            </div>
            <div className="text-sm text-gray-600">Forced Entries</div>
          </div>
        </div>

        {/* Entries Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            <span className="ml-2 text-gray-600">Memuat rekod...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Tiada rekod dijumpai</div>
            <div className="text-gray-400 text-sm mt-2">Data akan muncul di sini apabila ada kemasukan baru</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🧍 Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🏠 House
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🕒 Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🧾 Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🖼️ Photo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Tiada rekod dijumpai
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, index) => {
                    // Defensive checks for entry data
                    const safeEntry = entry || {}
                    const safeTimestamp = safeEntry.timestamp || new Date().toISOString()
                    
                    return (
                      <tr 
                        key={safeEntry.id || `entry-${index}`} 
                        className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-sky-50' : 'bg-white'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {safeEntry.user_id ? `User ${safeEntry.user_id.slice(-8)}` : 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Entry ID: {safeEntry.id?.slice(-8) || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {safeEntry.user_id ? `User ${safeEntry.user_id.slice(-8)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(safeTimestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getEntryTypeBadge(safeEntry.entry_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {safeEntry.selfie_url ? (
                            <button
                              onClick={() => openImageModal(safeEntry.selfie_url)}
                              className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-sky-500 transition-colors"
                            >
                              <img
                                src={safeEntry.selfie_url}
                                alt="Entry photo"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'block'
                                }}
                              />
                              <span className="text-gray-400 text-xs" style={{display: 'none'}}>Error</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">No photo</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Photo Preview</h3>
                <button
                  onClick={closeImageModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage}
                  alt="Full size photo"
                  className="max-w-full max-h-96 object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
