import { useState, useEffect } from 'react'
import { useEntries } from '../hooks/useEntries'
import EntryTable from './EntryTable'

const AdminDashboard = () => {
  const { entries, loading } = useEntries()
  const [stats, setStats] = useState({
    totalEntries: 0,
    todayEntries: 0,
    weekEntries: 0,
    monthEntries: 0,
    lastWeekEntries: 0,
    lastMonthEntries: 0,
    visitors: 0,
    residents: 0,
    forcedEntries: 0,
  })
  const [resetInfo, setResetInfo] = useState({
    today: '',
    week: '',
    month: '',
  })

  useEffect(() => {
    if (entries.length > 0) {
      const now = new Date()
      const options = { timeZone: 'Asia/Kuala_Lumpur' }

      // Today
      const today = new Date(now.toLocaleString('en-US', options).split(',')[0])
      const todayReset = new Date(today)
      todayReset.setHours(0, 0, 0, 0)

      // This Week (Mon–Sun)
      const currentDay = now.getDay()
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - daysSinceMonday)
      startOfWeek.setHours(0, 0, 0, 0)

      // Last Week
      const startOfLastWeek = new Date(startOfWeek)
      startOfLastWeek.setDate(startOfWeek.getDate() - 7)
      const endOfLastWeek = new Date(startOfWeek)
      endOfLastWeek.setMilliseconds(-1)

      // This Month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Last Month
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      startOfLastMonth.setHours(0, 0, 0, 0)
      endOfLastMonth.setHours(23, 59, 59, 999)

      const formatMY = (date) =>
        date.toLocaleString('ms-MY', {
          timeZone: 'Asia/Kuala_Lumpur',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })

      const todayEntries = entries.filter(e => {
        const entryDate = new Date(e.timestamp)
        return entryDate.toDateString() === today.toDateString()
      })
      const weekEntries = entries.filter(e => {
        const t = new Date(e.timestamp)
        return t >= startOfWeek && t <= now
      })
      const lastWeekEntries = entries.filter(e => {
        const t = new Date(e.timestamp)
        return t >= startOfLastWeek && t <= endOfLastWeek
      })
      const monthEntries = entries.filter(e => {
        const t = new Date(e.timestamp)
        return t >= startOfMonth && t <= now
      })
      const lastMonthEntries = entries.filter(e => {
        const t = new Date(e.timestamp)
        return t >= startOfLastMonth && t <= endOfLastMonth
      })

      setStats({
        totalEntries: entries.length,
        todayEntries: todayEntries.length,
        weekEntries: weekEntries.length,
        monthEntries: monthEntries.length,
        lastWeekEntries: lastWeekEntries.length,
        lastMonthEntries: lastMonthEntries.length,
        visitors: entries.filter(e => e.user_type === 'visitor').length,
        residents: entries.filter(e =>
          ['resident_unpaid', 'resident_paid', 'resident'].includes(e.user_type)
        ).length,
        vendors: entries.filter(e =>
          e.notes?.toLowerCase().includes('vendor') ||
          e.category?.toLowerCase().includes('vendor')
        ).length,
        others: entries.filter(e =>
          e.notes?.toLowerCase().includes('lain-lain') ||
          e.category?.toLowerCase().includes('lain-lain')
        ).length,
        forcedEntries: entries.filter(e => e.entry_type === 'forced_by_guard').length,
      });
                  setResetInfo({
        today: formatMY(todayReset),
        week: formatMY(startOfWeek),
        month: formatMY(startOfMonth),
      })
    }
  }, [entries])

  // ✅ Trend with color
  const renderTrend = (current, previous, label) => {
    if (previous === 0) return <span className="text-gray-400">—</span>
    const diff = ((current - previous) / previous) * 100
    if (diff > 0)
      return (
        <span className="text-green-600">
          📈 +{diff.toFixed(1)}% vs last {label}
        </span>
      )
    if (diff < 0)
      return (
        <span className="text-red-600">
          📉 {diff.toFixed(1)}% vs last {label}
        </span>
      )
    return <span className="text-gray-400">➖ No change</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Monitor all entry activity and system statistics
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated:{' '}
            {new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Total */}
        <div className="card text-center">
          <div className="text-4xl mb-1">📊</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 transition-all duration-300">            
            {stats.totalEntries}
          </div>
          <div className="text-gray-600">Total Entries</div>
        </div>

        {/* Today */}
        <div className="card text-center">
          <div className="text-4xl mb-1">🕒</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 transition-all duration-300">
            {stats.todayEntries}
          </div>
          <div className="text-gray-600 mb-1">Today's Entries</div>
          <div className="text-xs text-gray-400">Last reset: {resetInfo.today}</div>
        </div>

        {/* Week */}
        <div className="card text-center">
          <div className="text-4xl mb-1">🗓️</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 transition-all duration-300">
            {stats.weekEntries}
          </div>
          <div className="text-gray-600 mb-1">Entries This Week</div>
          <div className="text-xs mb-1">{renderTrend(stats.weekEntries, stats.lastWeekEntries, 'week')}</div>
          <div className="text-xs text-gray-400">Last reset: {resetInfo.week}</div>
        </div>

        {/* Month */}
        <div className="card text-center">
          <div className="text-4xl mb-1">📆</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 transition-all duration-300">
            {stats.monthEntries}
          </div>
          <div className="text-gray-600 mb-1">Entries This Month</div>
          <div className="text-xs mb-1">{renderTrend(stats.monthEntries, stats.lastMonthEntries, 'month')}</div>
          <div className="text-xs text-gray-400">Last reset: {resetInfo.month}</div>
        </div>

        {/* Visitors */}
        <div className="card text-center">
          <div className="text-4xl mb-1">👥</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 transition-all duration-300">
            {stats.visitors}</div>
          <div className="text-gray-600">Visitors</div>
        </div>

        {/* Residents */}
        <div className="card text-center">
          <div className="text-4xl mb-1">🏠</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 transition-all duration-300">
            {stats.residents}</div>
          <div className="text-gray-600">Residents</div>
        </div>

          {/* Vendors */}
          <div className="card text-center">
            <div className="text-4xl mb-1">📦</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 transition-all duration-300">
              {stats.vendors}</div>
            <div className="text-gray-600">Vendors</div>
          </div>

          {/* Lain-lain */}
          <div className="card text-center">
            <div className="text-4xl mb-1">🧾</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 transition-all duration-300">
              {stats.others}</div>
            <div className="text-gray-600">Lain-lain Urusan</div>
          </div>

        {/* Forced */}
        <div className="card text-center">
          <div className="text-4xl mb-1">🚨</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 transition-all duration-300">
            {stats.forcedEntries}</div>
          <div className="text-gray-600">Forced Entries</div>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            System Status: Online
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Real-time monitoring is active. New entries will appear automatically.
        </p>
      </div>

      {/* Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Entry Records
        </h3>
        <EntryTable entries={entries} loading={loading} />
      </div>
    </div>
  )
}

export default AdminDashboard
