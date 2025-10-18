#!/usr/bin/env node

/**
 * AHE SmartGate - Test with Authorization Header
 * Tests the notify-telegram Edge Function with authorization header
 */

const EDGE_FUNCTION_URL = 'https://kpukhpavdxidnoexfljv.functions.supabase.co/notify-telegram';

// Test payload for public access
const testPayload = {
  record: {
    id: 'auth-test-' + Date.now(),
    user_id: 'auth-user-' + Date.now(),
    entry_type: 'normal',
    selfie_url: 'https://placekitten.com/400/400',
    notes: 'Test with Authorization Header',
    timestamp: '2025-10-18T12:00:00Z',
    users: {
      name: 'Public Access Test',
      user_type: 'visitor',
      house_number: '1143 Jalan 22'
    }
  }
};

async function testWithAuth() {
  console.log('🧪 Testing AHE SmartGate Edge Function (With Auth Header)...\n');
  
  console.log('📤 Sending payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy-token'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Function call success (200 OK)');
      console.log('📱 Telegram Response:', JSON.stringify(responseData, null, 2));
      
      if (responseData.success) {
        console.log('\n🎉 ✅ Function works with auth header');
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
console.log('🚀 AHE SmartGate Auth Header Tester');
console.log('===================================\n');

testWithAuth()
  .then(() => {
    console.log('\n✨ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
