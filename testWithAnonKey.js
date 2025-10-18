#!/usr/bin/env node

/**
 * AHE SmartGate - Test with Anon Key
 * Tests the notify-telegram Edge Function with anon key
 */

const EDGE_FUNCTION_URL = 'https://kpukhpavdxidnoexfljv.functions.supabase.co/notify-telegram';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s';

// Test payload for public access
const testPayload = {
  record: {
    id: 'anon-test-' + Date.now(),
    user_id: 'anon-user-' + Date.now(),
    entry_type: 'normal',
    selfie_url: 'https://placekitten.com/400/400',
    notes: 'Test with Anon Key',
    timestamp: '2025-10-18T12:00:00Z',
    users: {
      name: 'Public Access Test',
      user_type: 'visitor',
      house_number: '1143 Jalan 22'
    }
  }
};

async function testWithAnonKey() {
  console.log('🧪 Testing AHE SmartGate Edge Function (With Anon Key)...\n');
  
  console.log('📤 Sending payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Function call success (200 OK)');
      console.log('📱 Telegram Response:', JSON.stringify(responseData, null, 2));
      
      if (responseData.success) {
        console.log('\n🎉 ✅ Function works with anon key');
        console.log('📬 Check your Telegram group "AHE SmartGate" for the notification.');
        console.log('🐱 Expected: Message with kitten image attached');
      } else {
        console.log('\n⚠️  Function returned success but with warnings');
      }
    } else {
      console.log('❌ Function call failed');
      console.log('📄 Error Response:', JSON.stringify(responseData, null, 2));
    }

  } catch (error) {
    console.log('💥 Network/Request Error:');
    console.log('Error:', error.message);
  }
}

// Run the test
console.log('🚀 AHE SmartGate Anon Key Tester');
console.log('=================================\n');

testWithAnonKey()
  .then(() => {
    console.log('\n✨ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
