import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSession } from './hooks/useSession'
import RegisterPage from './pages/RegisterPage'
import GuardDashboard from './pages/GuardDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import EntryForm from './components/EntryForm'

function App() {
  const { session, profile, loading, signOut } = useSession()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* 🧭 Top Navigation Bar */}
        <nav className="bg-sky-700 text-white py-3 shadow-md">
          <div className="container mx-auto flex justify-between items-center px-4">
            <div className="flex space-x-6 font-semibold">
              <Link to="/" className="hover:text-yellow-300 transition-colors">
                🏠 Visitor Check-In
              </Link>
              {session && (
                <>
                  <Link to="/guard" className="hover:text-yellow-300 transition-colors">
                    🚨 Guard Dashboard
                  </Link>
                  <Link to="/admin" className="hover:text-yellow-300 transition-colors">
                    📊 Admin Dashboard
                  </Link>
                </>
              )}
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-sm">
                    Welcome, {profile?.full_name || 'User'} ({profile?.role})
                  </span>
                  <button
                    onClick={signOut}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link 
                    to="/login" 
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Entry form - accessible to all */}
          <Route path="/" element={<EntryForm />} />
          
          {/* Protected routes */}
          <Route 
            path="/guard" 
            element={
              <ProtectedRoute role="guard">
                <GuardDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect authenticated users to appropriate dashboard */}
          <Route 
            path="/dashboard" 
            element={
              session ? (
                profile?.role === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/guard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
