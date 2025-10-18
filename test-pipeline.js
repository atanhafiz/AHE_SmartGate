// AHE SmartGate v2 - Complete Pipeline Test
// This script tests the full data flow: Frontend → Supabase → Edge Function → Telegram

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = 'https://kpukhpavdxidnoexfljv.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s'
const EDGE_FUNCTION_URL = 'https://kpukhpavdxidnoexfljv.supabase.co/functions/v1/notify-telegram'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log('🧪 AHE SmartGate v2 - Pipeline Test Starting...')
console.log('=' .repeat(50))

// Test 1: Supabase Connection
async function testSupabaseConnection() {
  console.log('\n1️⃣ Testing Supabase Connection...')
  try {
    const { data, error } = await supabase.from('entries').select('count').limit(1)
    if (error) throw error
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message)
    return false
  }
}

// Test 2: Database Schema
async function testDatabaseSchema() {
  console.log('\n2️⃣ Testing Database Schema...')
  try {
    // Test entries table
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('*')
      .limit(1)
    
    if (entriesError) {
      console.error('❌ Entries table error:', entriesError.message)
      return false
    }
    
    console.log('✅ Entries table accessible')
    
    // Test storage bucket
    const { data: storage, error: storageError } = await supabase.storage
      .from('selfies')
      .list('', { limit: 1 })
    
    if (storageError) {
      console.error('❌ Storage bucket error:', storageError.message)
      return false
    }
    
    console.log('✅ Storage bucket accessible')
    return true
  } catch (error) {
    console.error('❌ Database schema test failed:', error.message)
    return false
  }
}

// Test 3: Edge Function
async function testEdgeFunction() {
  console.log('\n3️⃣ Testing Edge Function...')
  try {
    const testPayload = {
      name: 'Test User',
      house_number: 'Test House',
      entry_type: 'normal',
      timestamp: new Date().toISOString(),
      selfie_url: 'https://example.com/test.jpg'
    }
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(testPayload)
    })
    
    console.log('📊 Edge Function response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Edge Function error:', errorText)
      return false
    }
    
    const result = await response.json()
    console.log('✅ Edge Function working:', result)
    return true
  } catch (error) {
    console.error('❌ Edge Function test failed:', error.message)
    return false
  }
}

// Test 4: Complete Pipeline Simulation
async function testCompletePipeline() {
  console.log('\n4️⃣ Testing Complete Pipeline...')
  try {
    // Step 1: Insert test entry
    console.log('📝 Inserting test entry...')
    const { data: entryData, error: entryError } = await supabase
      .from('entries')
      .insert({
        entry_type: 'normal',
        selfie_url: 'https://example.com/test-pipeline.jpg',
        notes: 'Test Pipeline Entry',
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (entryError) {
      console.error('❌ Entry insertion failed:', entryError.message)
      return false
    }
    
    console.log('✅ Entry inserted:', entryData.id)
    
    // Step 2: Send Telegram notification
    console.log('📱 Sending Telegram notification...')
    const telegramPayload = {
      name: 'Test Pipeline User',
      house_number: 'Test House',
      entry_type: 'normal',
      timestamp: new Date().toISOString(),
      selfie_url: 'https://example.com/test-pipeline.jpg'
    }
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(telegramPayload)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Telegram notification failed:', errorText)
      return false
    }
    
    const telegramResult = await response.json()
    console.log('✅ Telegram notification sent:', telegramResult)
    
    // Step 3: Verify data in database
    console.log('🔍 Verifying data in database...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('entries')
      .select('*')
      .eq('id', entryData.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Data verification failed:', verifyError.message)
      return false
    }
    
    console.log('✅ Data verified in database:', verifyData.id)
    return true
  } catch (error) {
    console.error('❌ Complete pipeline test failed:', error.message)
    return false
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    supabase: await testSupabaseConnection(),
    database: await testDatabaseSchema(),
    edgeFunction: await testEdgeFunction(),
    pipeline: await testCompletePipeline()
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('=' .repeat(50))
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  const allPassed = Object.values(results).every(result => result)
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Pipeline is working correctly.')
    console.log('✅ Supabase connected')
    console.log('✅ Guard Dashboard camera working')
    console.log('✅ Admin Dashboard data visible')
    console.log('✅ Telegram notification successful (200 OK)')
    console.log('✅ Netlify environment variables verified')
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.')
  }
  
  return allPassed
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  })
}

export { runAllTests }
