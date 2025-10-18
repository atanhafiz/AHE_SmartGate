// Test script for notify-telegram Edge Function
// This script tests the fixed Edge Function with various payload structures

const EDGE_FUNCTION_URL = 'https://kpukhpavdxidnoexfljv.supabase.co/functions/v1/notify-telegram'

// Test 1: EntryForm payload (new format)
async function testEntryFormPayload() {
  console.log('🧪 Testing EntryForm payload...')
  
  const payload = {
    name: "Test Visitor",
    house_number: "1143 Jalan 22",
    entry_type: "normal",
    timestamp: new Date().toISOString(),
    selfie_url: "https://placekitten.com/300/300"
  }
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s`
      },
      body: JSON.stringify(payload)
    })
    
    console.log('📊 Response status:', response.status)
    const result = await response.json()
    console.log('📦 Response:', result)
    
    if (response.ok) {
      console.log('✅ EntryForm payload test PASSED')
      return true
    } else {
      console.log('❌ EntryForm payload test FAILED')
      return false
    }
  } catch (error) {
    console.error('❌ EntryForm payload test ERROR:', error)
    return false
  }
}

// Test 2: GuardDashboard payload
async function testGuardDashboardPayload() {
  console.log('🧪 Testing GuardDashboard payload...')
  
  const payload = {
    name: "Reported by Guard",
    house_number: "-",
    entry_type: "forced_by_guard",
    timestamp: new Date().toISOString(),
    selfie_url: "https://placekitten.com/400/400"
  }
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s`
      },
      body: JSON.stringify(payload)
    })
    
    console.log('📊 Response status:', response.status)
    const result = await response.json()
    console.log('📦 Response:', result)
    
    if (response.ok) {
      console.log('✅ GuardDashboard payload test PASSED')
      return true
    } else {
      console.log('❌ GuardDashboard payload test FAILED')
      return false
    }
  } catch (error) {
    console.error('❌ GuardDashboard payload test ERROR:', error)
    return false
  }
}

// Test 3: Legacy payload format (with record.users)
async function testLegacyPayload() {
  console.log('🧪 Testing legacy payload format...')
  
  const payload = {
    record: {
      users: {
        name: "Legacy User",
        house_number: "Legacy House"
      },
      entry_type: "normal",
      timestamp: new Date().toISOString(),
      selfie_url: "https://placekitten.com/500/500"
    }
  }
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s`
      },
      body: JSON.stringify(payload)
    })
    
    console.log('📊 Response status:', response.status)
    const result = await response.json()
    console.log('📦 Response:', result)
    
    if (response.ok) {
      console.log('✅ Legacy payload test PASSED')
      return true
    } else {
      console.log('❌ Legacy payload test FAILED')
      return false
    }
  } catch (error) {
    console.error('❌ Legacy payload test ERROR:', error)
    return false
  }
}

// Test 4: Minimal payload (no optional fields)
async function testMinimalPayload() {
  console.log('🧪 Testing minimal payload...')
  
  const payload = {
    entry_type: "normal"
  }
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s`
      },
      body: JSON.stringify(payload)
    })
    
    console.log('📊 Response status:', response.status)
    const result = await response.json()
    console.log('📦 Response:', result)
    
    if (response.ok) {
      console.log('✅ Minimal payload test PASSED')
      return true
    } else {
      console.log('❌ Minimal payload test FAILED')
      return false
    }
  } catch (error) {
    console.error('❌ Minimal payload test ERROR:', error)
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Edge Function Tests...')
  console.log('=' .repeat(50))
  
  const results = {
    entryForm: await testEntryFormPayload(),
    guardDashboard: await testGuardDashboardPayload(),
    legacy: await testLegacyPayload(),
    minimal: await testMinimalPayload()
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('=' .repeat(50))
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  const allPassed = Object.values(results).every(result => result)
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Edge Function is working correctly.')
    console.log('✅ Handles EntryForm payloads')
    console.log('✅ Handles GuardDashboard payloads')
    console.log('✅ Handles legacy payloads')
    console.log('✅ Handles minimal payloads')
    console.log('✅ No undefined users errors')
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
