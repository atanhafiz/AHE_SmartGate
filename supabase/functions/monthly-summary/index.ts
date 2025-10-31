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

    // 🕒 Malaysia Time
    const nowMY = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
    const startOfMonth = new Date(nowMY.getFullYear(), nowMY.getMonth(), 1);
    const endOfMonth = new Date(nowMY);
    endOfMonth.setHours(23, 59, 59, 999);

    // 🧮 Ambil semua entry bulan ni
    const { data: entries, error } = await supabase
      .from("entries")
      .select("user_type, entry_type, timestamp")
      .gte("timestamp", startOfMonth.toISOString())
      .lte("timestamp", endOfMonth.toISOString());

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

    // 🧾 Tarikh format
    const monthMY = nowMY.toLocaleString("ms-MY", {
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kuala_Lumpur",
    });

    // 💸 Reset unpaid (contoh: reset status semua unpaid ke unpaid baru)
    const { error: resetError } = await supabase
      .from("users")
      .update({ status: "unpaid" })
      .or("last_payment.is.null,last_payment.lt." + startOfMonth.toISOString());

    if (resetError) console.error("⚠️ Reset unpaid error:", resetError);

    // 📨 Format laporan Telegram
    const message = `
📆 <b>AHE SmartGate Monthly Summary</b> (${monthMY})
👥 <b>Visitors:</b> ${count.visitor}
🏠 <b>Residents:</b> ${count.resident}
📦 <b>Vendors:</b> ${count.vendor}
🧾 <b>Lain-lain:</b> ${count.other}
🚨 <b>Forced Entries:</b> ${count.forced}

💰 <b>Reset Status:</b> Sistem telah menyemak semula status pembayaran bulanan semua penghuni.
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

    console.log("✅ Monthly Summary sent successfully");
    return new Response("Monthly Summary Sent", { status: 200 });
  } catch (err) {
    console.error("🔥 Error in monthly-summary:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
