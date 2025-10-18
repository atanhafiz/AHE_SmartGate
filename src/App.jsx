import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSession } from './hooks/useSession'
import { useState, useEffect } from 'react'
import RegisterPage from './pages/RegisterPage'
import GuardDashboard from './pages/GuardDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import EntryForm from './components/EntryForm'

function App() {
  const { session, profile, loading, signOut } = useSession()
  const [darkMode, setDarkMode] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [darkMode])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  const navLinks = [
    { path: "/", label: "🏠 Visitor Check-In", public: true },
    { path: "/guard", label: "🚨 Guard Dashboard", public: false, role: "guard" },
    { path: "/admin", label: "📊 Admin Dashboard", public: false, role: "admin" },
  ]

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
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
        
        {/* 🔹 ENHANCED NAVBAR */}
        <nav className="bg-sky-700 dark:bg-gray-900 text-white py-3 shadow-md">
          <div className="container mx-auto px-4 flex justify-between items-center">
            {/* Left: Logo & Title */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-sky-700 font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-lg">AHE SmartGate</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white text-2xl focus:outline-none hover:text-yellow-300 transition-colors"
            >
              ☰
            </button>

            {/* Nav Links */}
            <div
              className={`${
                menuOpen ? "block" : "hidden"
              } md:flex space-y-2 md:space-y-0 md:space-x-6 absolute md:static top-14 left-0 w-full md:w-auto bg-sky-700 dark:bg-gray-900 md:bg-transparent p-4 md:p-0 z-50`}
            >
              {navLinks.map((link) => {
                // Show public links or role-appropriate links
                const shouldShow = link.public || (session && profile?.role === link.role)
                
                if (!shouldShow) return null

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block text-white hover:text-yellow-300 font-semibold transition-colors ${
                        isActive ? "underline decoration-yellow-400 decoration-2 underline-offset-4" : ""
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
              })}
            </div>

            {/* Right: User info, Dark Mode Toggle, Logout */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? "🌙 Dark" : "🌞 Light"}
              </button>

              {/* User info and logout */}
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
                  <NavLink 
                    to="/login" 
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Login
                  </NavLink>
                  <NavLink 
                    to="/register" 
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Register
                  </NavLink>
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
