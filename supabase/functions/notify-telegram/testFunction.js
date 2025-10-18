#!/usr/bin/env node

/**
 * AHE SmartGate - Supabase Edge Function Test Script
 * Tests the notify-telegram Edge Function with sample data
 */

const EDGE_FUNCTION_URL = 'https://kpukhpavdxidnoexfljv.functions.supabase.co/notify-telegram';

// Test payload matching the Edge Function's expected structure
const testPayload = {
  record: {
    id: 'test-entry-' + Date.now(),
    user_id: 'test-user-' + Date.now(),
    entry_type: 'normal',
    selfie_url: 'https://placekitten.com/300/300',
    notes: 'Test entry from Node.js script',
    timestamp: new Date().toISOString(),
    users: {
      name: 'Test Visitor',
      user_type: 'visitor',
      house_number: '1143 Jalan 22'
    }
  }
};

async function testEdgeFunction() {
  console.log('🧪 Testing AHE SmartGate Edge Function...\n');
  
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
        console.log('\n🎉 Test completed successfully!');
        console.log('📬 Check your Telegram group "AHE SmartGate" for the notification.');
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
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if the Edge Function is deployed');
    console.log('2. Verify the URL is correct');
    console.log('3. Ensure environment variables are set in Supabase');
    console.log('4. Check Supabase function logs for errors');
  }
}

// Run the test
console.log('🚀 AHE SmartGate Edge Function Tester');
console.log('=====================================\n');

testEdgeFunction()
  .then(() => {
    console.log('\n✨ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
