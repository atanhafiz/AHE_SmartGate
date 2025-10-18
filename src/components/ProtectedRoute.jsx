import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, role }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      }

      setLoading(false);
    }

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" />;
  if (role && profile?.role !== role) return <Navigate to="/" />;
  return children;
}