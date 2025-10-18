import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
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
      <div className="min-h-screen flex items-center justify-center bg-sky-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  const navLinks = [
    { path: "/", label: "🏠 Visitor Check-In" },
    { path: "/guard", label: "🛡️ Guard Dashboard" },
    { path: "/admin", label: "📊 Admin Dashboard" },
  ]

  return (
    <Router>
      <div className="min-h-screen bg-sky-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
        
        {/* 🔹 ENTERPRISE NAVBAR */}
        <nav className="bg-sky-700 dark:bg-gray-900 text-white py-3 shadow-md relative z-50 transition-all">
          <div className="container mx-auto px-4 flex justify-between items-center">
            {/* Left: Logo */}
            <div className="flex items-center space-x-2">
              <img src="/favicon.ico" alt="SmartGate Logo" className="w-7 h-7 rounded-md" />
              <span className="font-bold text-lg tracking-wide">AHE SmartGate</span>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white text-2xl focus:outline-none"
            >
              ☰
            </button>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `font-semibold hover:text-yellow-300 ${
                    isActive ? "underline decoration-yellow-400" : ""
                  }`
                }
              >
                🏠 Visitor Check-In
              </NavLink>
              <NavLink
                to="/guard"
                className={({ isActive }) =>
                  `font-semibold hover:text-yellow-300 ${
                    isActive ? "underline decoration-yellow-400" : ""
                  }`
                }
              >
                🛡️ Guard Dashboard
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `font-semibold hover:text-yellow-300 ${
                    isActive ? "underline decoration-yellow-400" : ""
                  }`
                }
              >
                📊 Admin Dashboard
              </NavLink>

              {/* Right Side: Login + Theme */}
              <div className="flex items-center space-x-3">
                <NavLink to="/login" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-md text-sm font-semibold shadow-sm transition-colors">
                  Login
                </NavLink>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {darkMode ? "🌙 Dark" : "☀️ Light"}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {menuOpen && (
            <div className="md:hidden bg-sky-700 dark:bg-gray-800 text-white p-4 space-y-4 absolute top-full left-0 w-full z-50 transition-all duration-300">
              <NavLink
                to="/"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block hover:text-yellow-300 font-semibold ${
                    isActive ? "underline decoration-yellow-400" : ""
                  }`
                }
              >
                🏠 Visitor Check-In
              </NavLink>
              <NavLink
                to="/guard"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block hover:text-yellow-300 font-semibold ${
                    isActive ? "underline decoration-yellow-400" : ""
                  }`
                }
              >
                🛡️ Guard Dashboard
              </NavLink>
              <NavLink
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block hover:text-yellow-300 font-semibold ${
                    isActive ? "underline decoration-yellow-400" : ""
                  }`
                }
              >
                📊 Admin Dashboard
              </NavLink>
              <NavLink to="/login" className="block w-full bg-indigo-500 hover:bg-indigo-600 py-2 rounded-md font-semibold text-center transition-colors" onClick={() => setMenuOpen(false)}>
                Login
              </NavLink>
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  setMenuOpen(false);
                }}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-md font-semibold transition-colors"
              >
                {darkMode ? "🌙 Dark" : "☀️ Light"}
              </button>
            </div>
          )}
        </nav>

        {/* 🔹 ROUTES */}
        <main className="min-h-screen bg-sky-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
