import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children, role }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        const { data: p } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();
        setProfile(p);
      }
      setReady(true);
    };
    load();
  }, []);

  if (!ready)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );

  if (!session) return <Navigate to="/login" />;
  if (role && profile?.role !== role) return <Navigate to="/" />;

  return children;
}