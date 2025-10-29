import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import EntryForm from "./components/EntryForm";
import GuardDashboard from "./pages/GuardDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (session?.user?.id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(p);
      } else {
        setProfile(null);
      }
    };
    loadProfile();
  }, [session]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-sky-700 to-cyan-700 text-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-2 font-extrabold tracking-wide">
            <img src="/favicon.ico" alt="AHE SmartGate" className="w-7 h-7 rounded" />
            <span className="hidden sm:inline">AHE SmartGate</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" className={linkClass}>🏠 Visitor Check-In</NavLink>
            <NavLink to="/guard" className={linkClass}>🛡️ Guard Dashboard</NavLink>
            <NavLink to="/admin" className={linkClass}>📊 Admin Dashboard</NavLink>

            {session ? (
              <div className="hidden md:flex items-center gap-2 pl-2 ml-2 border-l border-white/20">
                <span className="text-xs md:text-sm font-semibold">
                  {profile?.full_name || "User"} ({profile?.role || "?"})
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1 rounded-md text-sm font-semibold bg-red-500 hover:bg-red-600 shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="ml-2 px-3 py-1 rounded-md text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 shadow-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
        <div className="h-[1px] w-full bg-white/15 shadow-inner" />
      </nav>

      <Routes>
        <Route path="/" element={<EntryForm />} />
        <Route path="/login" element={<LoginPage />} />
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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
