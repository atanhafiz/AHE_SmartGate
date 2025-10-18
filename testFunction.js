// testFunction.js
// Quick tester for Supabase Edge Function "notify-telegram"

console.log("🚀 AHE SmartGate Edge Function Tester\n=====================================\n");

const FUNCTION_URL = "https://kpukhpavdxidnoexfljv.functions.supabase.co/notify-telegram";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s"; // 🔑 Real anon key

const payload = {
  record: {
    id: "test-entry-" + Date.now(),
    user_id: "test-user-" + Date.now(),
    entry_type: "normal",
    selfie_url: "https://placekitten.com/300/300",
    notes: "Test entry from Node.js script",
    timestamp: new Date().toISOString(),
    users: {
      name: "Test Visitor",
      user_type: "visitor",
      house_number: "1143 Jalan 22"
    }
  }
};

console.log("🧪 Testing AHE SmartGate Edge Function...\n");
console.log("📤 Sending payload:");
console.log(JSON.stringify(payload, null, 2));
console.log("\n==================================================\n");

(async () => {
  try {
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    console.log(`📊 Response Status: ${res.status}`);

    if (res.ok) {
      console.log("✅ Function call success!");
      console.log("📱 Telegram Response:", data);
      console.log("\n🎉 Check your Telegram group 'AHE SmartGate' for the notification!");
      console.log("🐱 Expected: Message with visitor info and kitten image");
    } else {
      console.log("❌ Function call failed");
      console.log("📄 Error Response:", data);
    }
  } catch (err) {
    console.error("🚨 Error executing test:", err.message);
  } finally {
    console.log("\n✨ Test script completed");
  }
})();
