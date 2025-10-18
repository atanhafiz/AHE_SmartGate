import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ✅ Step 1: Fetch all Auth users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    console.log("🔍 Found users:", users.users.length);

    // ✅ Step 2: Match admin & guard users by email
    const demoUsers = [
      { email: "admin@example.com", full_name: "Admin User", role: "admin" },
      { email: "guard@example.com", full_name: "Guard User", role: "guard" },
    ];

    for (const demo of demoUsers) {
      const foundUser = users.users.find((u) => u.email === demo.email);
      if (!foundUser) {
        console.warn(`⚠️ User ${demo.email} not found in auth.users`);
        continue;
      }

      console.log(`✅ Linking ${demo.email} → ${foundUser.id}`);

      // ✅ Step 3: Insert or update profile
      const { error: insertError } = await supabase
        .from("profiles")
        .upsert({
          id: foundUser.id,
          full_name: demo.full_name,
          role: demo.role,
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Profiles seeded successfully" }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("🔥 Seeder Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
