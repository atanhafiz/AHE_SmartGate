import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      console.log("🔐 Attempting login:", formData.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      console.log("🧩 Login response:", data);
      const user = data.user;
      console.log("✅ Login success:", user);

      // Ensure session persistence
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        console.log("🔒 Session persisted successfully");
      }

      // Fetch or create profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) console.warn("⚠️ Profile fetch error:", profileError.message);

      let finalRole = profile?.role;
      if (!profile) {
        // auto create if not exist
        const email = formData.email.toLowerCase();
        const role = email.includes("admin")
          ? "admin"
          : email.includes("guard")
          ? "guard"
          : "visitor";
        const fullName = email.split("@")[0];

        const { error: insertErr } = await supabase
          .from("profiles")
          .insert([{ id: user.id, full_name: fullName, role }]);

        if (insertErr) throw new Error("Failed to create user profile");
        finalRole = role;
        console.log("🆕 Auto-created profile:", role);
      }

      toast.success("Welcome back!");
      console.log("🎯 Redirecting user role:", finalRole);

      if (finalRole === "admin") navigate("/admin");
      else if (finalRole === "guard") navigate("/guard");
      else navigate("/");
    } catch (err) {
      console.error("❌ Login error:", err.message);
      toast.error(err.message || "Login failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            AHE SmartGate Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access guard and admin functions
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input-field mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="input-field mt-1"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              ← Back to Visitor Check-In
            </a>
          </div>
        </div>

        <div className="card bg-gray-50">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Demo Credentials</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Guard:</strong> guard@example.com / password123</div>
            <div><strong>Admin:</strong> admin@example.com / password123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
