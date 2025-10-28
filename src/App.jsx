import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import EntryForm from "./components/EntryForm";
import GuardDashboard from "./pages/GuardDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", data.session.user.id)
          .single();
        setProfile(p);
      }
    };
    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setProfile(null);
        navigate("/");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    navigate("/");
  };

  return (
    <>
      <nav className="bg-sky-700 text-white py-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2 font-bold">
            <img src="/favicon.ico" alt="Logo" className="w-7 h-7" />
            <span>AHE SmartGate</span>
          </div>
          <div className="flex items-center space-x-4">
            <NavLink to="/" className="hover:text-yellow-300">🏠 Visitor Check-In</NavLink>
            <NavLink to="/guard" className="hover:text-yellow-300">🛡️ Guard Dashboard</NavLink>
            <NavLink to="/admin" className="hover:text-yellow-300">📊 Admin Dashboard</NavLink>
            {session ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold">
                  Welcome, {profile?.full_name || "User"} ({profile?.role || "?"})
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded-md text-sm font-semibold"
              >
                Login
              </button>
            )}
          </div>
        </div>
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
    <Router>
      <AppContent />
    </Router>
  );
}
