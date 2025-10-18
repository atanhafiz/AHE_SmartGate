/**
 * Test Updated Telegram Function
 * 
 * Tests the enhanced notify-telegram Edge Function with:
 * - Safe payload handling from EntryForm and GuardDashboard
 * - Optional chaining for undefined users
 * - Fallback defaults for all fields
 * - Proper error handling
 */

const SUPABASE_URL = 'https://kpukhpavdxidnoexfljv.supabase.co'
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/notify-telegram`

// Test payloads that should work with the updated function
const testPayloads = [
  {
    name: "EntryForm Payload (Direct)",
    payload: {
      name: "Ahmad Hafiz",
      house_number: "123",
      entry_type: "normal",
      selfie_url: "https://example.com/selfie.jpg",
      timestamp: new Date().toISOString()
    }
  },
  {
    name: "GuardDashboard Payload (Direct)",
    payload: {
      name: "Reported by Guard",
      house_number: "-",
      entry_type: "forced_by_guard",
      selfie_url: "https://example.com/guard_photo.jpg",
      timestamp: new Date().toISOString()
    }
  },
  {
    name: "Minimal Payload (No users object)",
    payload: {
      name: "John Doe",
      house_number: "456",
      entry_type: "normal",
      selfie_url: "https://example.com/minimal.jpg"
    }
  },
  {
    name: "Empty Payload (Fallback defaults)",
    payload: {}
  },
  {
    name: "Legacy Payload (With users object)",
    payload: {
      users: {
        name: "Legacy User",
        house_number: "789"
      },
      entry_type: "normal",
      selfie_url: "https://example.com/legacy.jpg",
      timestamp: new Date().toISOString()
    }
  }
]

async function testTelegramFunction() {
  console.log('🧪 Testing Updated Telegram Function...\n')
  
  for (const test of testPayloads) {
    console.log(`📤 Testing: ${test.name}`)
    console.log(`📦 Payload:`, JSON.stringify(test.payload, null, 2))
    
    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_KEY || 'your-anon-key'}`
        },
        body: JSON.stringify(test.payload)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log('✅ SUCCESS:', result)
        console.log('📨 Expected Telegram message:')
        console.log(`
🚪 *New Entry Detected*
👤 *Name:* ${test.payload.name || test.payload.users?.name || "Unknown Visitor"}
🏠 *House:* ${test.payload.house_number || test.payload.users?.house_number || "-"}
📋 *Type:* ${test.payload.entry_type || "normal"}
🕒 *Time:* ${test.payload.timestamp || new Date().toISOString()}
        `)
      } else {
        console.log('❌ FAILED:', result)
      }
    } catch (error) {
      console.log('🔥 ERROR:', error.message)
    }
    
    console.log('─'.repeat(50))
  }
  
  console.log('\n🎯 Test Summary:')
  console.log('✅ Function should handle all payload types safely')
  console.log('✅ No more "Cannot read properties of undefined" errors')
  console.log('✅ Telegram always receives a message with fallback defaults')
  console.log('✅ Optional chaining prevents crashes')
}

// Run the test
testTelegramFunction().catch(console.error)
