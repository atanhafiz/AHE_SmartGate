import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import EntryForm from "./components/EntryForm";
import GuardDashboard from "./pages/GuardDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", session.user.id)
          .single();

        if (!error && data) {
          setProfile(data);

          // ✅ Redirect ikut role
          if (data.role === "admin") navigate("/admin");
          else if (data.role === "guard") navigate("/guard");
        }
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
      
      {/* 🔹 Navbar */}
      <nav className="bg-sky-700 text-white py-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-3 font-bold">
            <img src="/favicon.ico" alt="Logo" className="w-7 h-7" />
            <span>AHE SmartGate</span>
          </div>

          <div className="flex items-center space-x-4">
            {!session ? (
              <button
                onClick={() => navigate("/login")}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Login
              </button>
            ) : (
              <>
                <span className="text-sm font-semibold">
                  Welcome, {profile?.full_name || "User"} ({profile?.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 🔹 Routing */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/guard" element={<ProtectedRoute role="guard"><GuardDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/" element={<EntryForm />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
