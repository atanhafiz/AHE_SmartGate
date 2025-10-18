import GuardDashboard from '../components/GuardDashboard'

const GuardPage = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Guard Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Monitor entries and manage security incidents
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-lg">
            <a
              href="/register"
              className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 font-medium"
            >
              Register Entry
            </a>
            <a
              href="/guard"
              className="px-4 py-2 rounded-md bg-primary-600 text-white font-medium"
            >
              Guard Dashboard
            </a>
            <a
              href="/admin"
              className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 font-medium"
            >
              Admin Dashboard
            </a>
          </nav>
        </div>

        {/* Guard Dashboard */}
        <GuardDashboard />
      </div>
    </div>
  )
}

export default GuardPage
