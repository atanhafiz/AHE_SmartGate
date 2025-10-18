import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await signIn(formData.email, formData.password)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Login successful!')
        // Redirect based on user role or to admin dashboard
        window.location.href = '/admin'
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            AHE SmartGate Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access guard and admin functions
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input-field mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="input-field mt-1"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/register"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              ← Back to Entry Registration
            </a>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="card bg-gray-50">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Demo Credentials</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Guard:</strong> guard@example.com / password123</div>
            <div><strong>Admin:</strong> admin@example.com / password123</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
