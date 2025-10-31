import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;

      const user = data.user;

      // Ensure session persistence
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Get role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role =
        profile?.role ||
        (formData.email.includes("admin")
          ? "admin"
          : formData.email.includes("guard")
          ? "guard"
          : "visitor");

      toast.success("Welcome back!");
      if (role === "admin") navigate("/admin");
      else if (role === "guard") navigate("/guard");
      else navigate("/");
    } catch (err) {
      toast.error(err.message || "Login failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🌈 Header Section */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 text-white text-center py-10 shadow-md">
        <div className="flex flex-col items-center justify-center">
          <img
            src="/favicon.ico"
            alt="AHE SmartGate Logo"
            className="w-16 h-16 mb-2 rounded-full shadow-lg bg-white p-2"
          />
          <h1 className="text-2xl font-extrabold tracking-wide">
            AHE SmartGate Portal
          </h1>
          <p className="text-sm opacity-90">Authorized Personnel Login Only</p>
        </div>
      </div>

      {/* 🔐 Login Card */}
      <div className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-blue-500 hover:underline text-sm font-medium"
            >
              ← Back to Visitor Check-In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-4">
        © {new Date().getFullYear()} AHE Technology Sdn Bhd. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
