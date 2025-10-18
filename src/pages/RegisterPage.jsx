import EntryForm from '../components/EntryForm'

const RegisterPage = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-center">
            <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <a
                href="/register"
                className="px-4 py-2 rounded-md bg-sky-600 text-white font-medium"
              >
                Register Entry
              </a>
              <a
                href="/guard"
                className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200 font-medium"
              >
                Guard Dashboard
              </a>
              <a
                href="/admin"
                className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200 font-medium"
              >
                Admin Dashboard
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Entry Form */}
      <EntryForm />
    </div>
  )
}

export default RegisterPage
