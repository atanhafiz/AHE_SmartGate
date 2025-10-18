#!/usr/bin/env node

/**
 * AHE SmartGate - Public Access Test Script
 * Tests the notify-telegram Edge Function without JWT authentication
 */

const EDGE_FUNCTION_URL = 'https://kpukhpavdxidnoexfljv.functions.supabase.co/notify-telegram';

// Test payload for public access
const testPayload = {
  record: {
    id: 'public-test-' + Date.now(),
    user_id: 'public-user-' + Date.now(),
    entry_type: 'normal',
    selfie_url: 'https://placekitten.com/400/400',
    notes: 'Public Access Test - No JWT required',
    timestamp: '2025-10-18T12:00:00Z',
    users: {
      name: 'Public Access Test',
      user_type: 'visitor',
      house_number: '1143 Jalan 22'
    }
  }
};

async function testPublicAccess() {
  console.log('🧪 Testing AHE SmartGate Edge Function (Public Access)...\n');
  
  console.log('📤 Sending payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Function call success (200 OK)');
      console.log('📱 Telegram Response:', JSON.stringify(responseData, null, 2));
      
      if (responseData.success) {
        console.log('\n🎉 ✅ Function works without JWT');
        console.log('📬 Check your Telegram group "AHE SmartGate" for the notification.');
        console.log('🐱 Expected: Message with kitten image attached');
      } else {
        console.log('\n⚠️  Function returned success but with warnings');
      }
    } else {
      console.log('❌ Function call failed');
      console.log('📄 Error Response:', JSON.stringify(responseData, null, 2));
      
      if (response.status === 401) {
        console.log('\n🔒 ❌ Still protected, check deno.json');
        console.log('💡 The function is still requiring JWT authentication');
      }
    }

  } catch (error) {
    console.log('💥 Network/Request Error:');
    console.log('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if the Edge Function is deployed');
    console.log('2. Verify the URL is correct');
    console.log('3. Ensure deno.json is properly configured');
    console.log('4. Check Supabase function logs for errors');
  }
}

// Run the test
console.log('🚀 AHE SmartGate Public Access Tester');
console.log('=====================================\n');

testPublicAccess()
  .then(() => {
    console.log('\n✨ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
