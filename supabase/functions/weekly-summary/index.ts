import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🇲🇾 Set masa Malaysia
    const nowMY = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
    const startOfWeek = new Date(nowMY);
    startOfWeek.setDate(nowMY.getDate() - 6); // 7 hari lepas
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(nowMY);
    endOfWeek.setHours(23, 59, 59, 999);

    // 🔍 Ambil data 7 hari
    const { data: entries, error } = await supabase
      .from("entries")
      .select("user_type, entry_type, timestamp")
      .gte("timestamp", startOfWeek.toISOString())
      .lte("timestamp", endOfWeek.toISOString());

    if (error) throw error;

    // 📊 Kiraan
    const count = { visitor: 0, resident: 0, vendor: 0, other: 0, forced: 0 };
    for (const e of entries || []) {
      if (e.entry_type === "forced_by_guard") count.forced++;
      else if (e.user_type?.includes("resident")) count.resident++;
      else if (e.user_type === "vendor") count.vendor++;
      else if (e.user_type === "other") count.other++;
      else count.visitor++;
    }

    const startMY = startOfWeek.toLocaleDateString("ms-MY", { timeZone: "Asia/Kuala_Lumpur", day: "2-digit", month: "short" });
    const endMY = endOfWeek.toLocaleDateString("ms-MY", { timeZone: "Asia/Kuala_Lumpur", day: "2-digit", month: "short", year: "numeric" });

    const message = `
📅 <b>AHE SmartGate Weekly Summary</b> (${startMY} – ${endMY})
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

    console.log("✅ Weekly Summary sent successfully");
    return new Response("Weekly Summary Sent", { status: 200 });
  } catch (err) {
    console.error("🔥 Error in weekly-summary:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
