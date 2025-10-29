import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("❌ Missing Telegram credentials");
      return new Response("Missing Telegram credentials", {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const body = await req.json();
    const record = body?.record || body;

    // Extract info dari payload
    const name = record?.users?.name || record?.name || "Unknown Visitor";
    const house = record?.users?.house_number || record?.house_number || "-";
    const phone = record?.phone_number || "-";
    const plate = record?.plate_number || "-";
    const entryType = record?.entry_type || "normal";
    const selfieUrl = record?.selfie_url || "";
      // 🇲🇾 Format tarikh & masa dalam Bahasa Melayu
      const date = new Date(record?.timestamp || new Date());
      const hari = date.toLocaleDateString("ms-MY", { weekday: "long", timeZone: "Asia/Kuala_Lumpur" });
      const tarikh = date.toLocaleDateString("ms-MY", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
      });
      const masa = date.toLocaleTimeString("ms-MY", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kuala_Lumpur",
      });
      const timestamp = `${hari}, ${tarikh} - ${masa}`;

    // Caption format (Markdown)
    const caption = `
        🚪 *Rekod Kemasukan Baharu Dikesan*
      👤 *Nama:* ${name}
      🏠 *No Rumah:* ${house}
      📞 *Telefon:* ${phone}
      🚗 *No Plat:* ${plate}
      🧾 *Jenis:* ${entryType}
      🕒 *Masa:* ${timestamp}
      `;

    // ✅ Send photo + caption together
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          photo: selfieUrl || "https://via.placeholder.com/600x400?text=No+Photo",
          caption,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("⚠️ Telegram sendPhoto failed:", errText);
      throw new Error(errText);
    }

    console.log("✅ Telegram notification sent successfully");
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("🔥 Telegram Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
