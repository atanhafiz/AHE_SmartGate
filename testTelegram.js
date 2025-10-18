// testTelegram.js
import fetch from "node-fetch";

const BOT_TOKEN = "8351952708:AAFd7aG5J8C5vidQ6fvLVSdX54RfK-F9zTc"; // Replace with your bot token
const CHAT_ID = -1003119983761; // Replace with your group chat_id

const TEST_MESSAGE = "🚀 Telegram Bot Test — If you see this, the bot is working!";

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

console.log("📤 Sending test message to Telegram...");

(async () => {
  try {
    const res = await fetch(TELEGRAM_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: TEST_MESSAGE,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    console.log("📊 Telegram API response status:", res.status);
    console.log("📦 Full response:", JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log("✅ Message sent successfully!");
    } else {
      console.log("❌ Telegram error:", data.description);
    }
  } catch (err) {
    console.error("🚨 Request failed:", err);
  }
})();
