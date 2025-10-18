import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  // 🔧 Handle preflight CORS request
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

    const name = record?.users?.name || record?.name || "Unknown Visitor";
    const house = record?.users?.house_number || record?.house_number || "-";
    const entryType = record?.entry_type || "normal";
    const selfieUrl = record?.selfie_url || "";
    const timestamp = record?.timestamp || new Date().toISOString();

    const message = `
🚪 *New Entry Detected*
👤 *Name:* ${name}
🏠 *House:* ${house}
📋 *Type:* ${entryType}
🕒 *Time:* ${timestamp}
    `;

    // Send Telegram text message
    const sendText = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!sendText.ok) {
      console.error("⚠️ Telegram sendMessage failed:", await sendText.text());
    }

    // Send photo if exists
    if (selfieUrl) {
      const sendPhoto = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            photo: selfieUrl,
          }),
        }
      );
      if (!sendPhoto.ok) {
        console.error("⚠️ Telegram sendPhoto failed:", await sendPhoto.text());
      }
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
