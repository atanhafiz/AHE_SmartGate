import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

export default function ProtectedRoute({ children, role }) {
  const { session, profile, loading } = useSession()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/login" />
  }

  // Check role-based access
  if (role && profile?.role !== role) {
    // Redirect to appropriate dashboard based on user's actual role
    if (profile?.role === 'admin') {
      return <Navigate to="/admin" />
    } else if (profile?.role === 'guard') {
      return <Navigate to="/guard" />
    } else {
      return <Navigate to="/" />
    }
  }

  return children
}
