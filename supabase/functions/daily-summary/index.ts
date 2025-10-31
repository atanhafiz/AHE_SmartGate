import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Force gunakan Service Role Key (public-safe)
serve(async (req) => {
  // Inject Service Role Key supaya function boleh run tanpa token
  Deno.env.set("SUPABASE_ANON_KEY", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // ✅ Handle CORS (boleh trigger dari luar)
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const myTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
    const startOfDay = new Date(myTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(myTime);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: entries, error } = await supabase
      .from("entries")
      .select("user_type, entry_type")
      .gte("timestamp", startOfDay.toISOString())
      .lte("timestamp", endOfDay.toISOString());

    if (error) throw error;

    const count = { visitor: 0, resident: 0, vendor: 0, other: 0, forced: 0 };
    for (const e of entries || []) {
      if (e.entry_type === "forced_by_guard") count.forced++;
      else if (e.user_type?.includes("resident")) count.resident++;
      else if (e.user_type === "vendor") count.vendor++;
      else if (e.user_type === "other") count.other++;
      else count.visitor++;
    }

    const todayMY = new Date().toLocaleDateString("ms-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const message = `
📊 <b>AHE SmartGate Daily Summary</b> (${todayMY})
👥 <b>Visitors:</b> ${count.visitor}
🏠 <b>Residents:</b> ${count.resident}
📦 <b>Vendors:</b> ${count.vendor}
🧾 <b>Lain-lain:</b> ${count.other}
🚨 <b>Forced Entries:</b> ${count.forced}
`;

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    if (!botToken || !chatId) throw new Error("Missing Telegram credentials");

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });

    if (!res.ok) throw new Error(await res.text());

    console.log("✅ Daily Summary sent successfully");
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("🔥 Error in daily-summary:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Content-Type": "application/json",
      },
    });
  }
});
