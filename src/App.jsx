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
  const [menuOpen, setMenuOpen] = useState(false);
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
      {/* 🔹 Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-sky-700 to-cyan-700 text-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2 font-extrabold tracking-wide">
            <img src="/favicon.ico" alt="AHE SmartGate" className="w-7 h-7 rounded" />
            <span className="hidden sm:inline">AHE SmartGate</span>
          </div>

          {/* Main Links (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <NavLink to="/" className={linkClass}>🏠 Visitor Check-In</NavLink>

            {/* Guard & Admin Links — hidden from visitor eyes on small screen */}
            {session && (
              <>
                <NavLink to="/guard" className={linkClass}>🛡️ Guard Dashboard</NavLink>
                <NavLink to="/admin" className={linkClass}>📊 Admin Dashboard</NavLink>
              </>
            )}

            {/* Logout section */}
            {session && (
              <div className="flex items-center gap-2 pl-2 ml-2 border-l border-white/20">
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
            )}
          </div>

          {/* 🔸 Hamburger Button (Mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden flex items-center px-3 py-2 border rounded text-white border-white/30 hover:bg-sky-600"
          >
            ☰
          </button>
        </div>

        {/* 🔸 Dropdown Menu (Mobile Only) */}
        {menuOpen && (
  <div
    className="absolute right-4 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 
               animate-fadeIn"
  >
    <ul className="py-2 text-gray-700 text-sm divide-y divide-gray-200">
      <li>
        <button
          onClick={() => {
            setMenuOpen(false);
            navigate("/");
          }}
          className="block w-full text-left px-4 py-2 hover:bg-sky-100 transition-colors duration-150"
        >
          Visitor
        </button>
      </li>
      <li>
        <button
          onClick={() => {
            setMenuOpen(false);
            navigate("/guard");
          }}
          className="block w-full text-left px-4 py-2 hover:bg-sky-100 transition-colors duration-150"
        >
          Guard
        </button>
      </li>
      <li>
        <button
          onClick={() => {
            setMenuOpen(false);
            navigate("/admin");
          }}
          className="block w-full text-left px-4 py-2 hover:bg-sky-100 transition-colors duration-150"
        >
          Admin
        </button>
      </li>
      {session && (
        <li>
          <button
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 transition-colors duration-150"
          >
            Logout
          </button>
        </li>
      )}
    </ul>
  </div>
)}

        <div className="h-[1px] w-full bg-white/15 shadow-inner" />
      </nav>

      {/* 🔹 Routes */}
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
