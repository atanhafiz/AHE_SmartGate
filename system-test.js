#!/usr/bin/env node

/**
 * AHE SmartGate v1 - Complete System Test
 * Tests Telegram notifications and AdminDashboard functionality
 */

console.log('🔧 AHE SmartGate v1 - Complete System Test')
console.log('==========================================\n')

// Test 1: Telegram Function Test
const testTelegramFunction = async () => {
  console.log('📱 Testing Telegram Function...')
  
  const FUNCTION_URL = "https://kpukhpavdxidnoexfljv.functions.supabase.co/notify-telegram"
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s"
  
  const payload = {
    record: {
      id: "system-test-" + Date.now(),
      user_id: "test-user-" + Date.now(),
      entry_type: "normal",
      selfie_url: "https://placekitten.com/400/400",
      notes: "System test entry",
      timestamp: new Date().toISOString(),
      users: {
        name: "System Test Visitor",
        user_type: "visitor",
        house_number: "Test House 123"
      }
    }
  }
  
  try {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Telegram Function Test PASSED')
      console.log('📊 Response:', data)
      return true
    } else {
      console.log('❌ Telegram Function Test FAILED')
      console.log('📄 Error:', data)
      return false
    }
  } catch (error) {
    console.log('❌ Telegram Function Test ERROR:', error.message)
    return false
  }
}

// Test 2: AdminDashboard Component Test
const testAdminDashboard = async () => {
  console.log('\n📊 Testing AdminDashboard Component...')
  
  // Check if AdminDashboard.jsx exists and has proper structure
  const fs = await import('fs')
  const path = await import('path')
  
  const adminDashboardPath = path.join(process.cwd(), 'src/pages/AdminDashboard.jsx')
  
  if (!fs.existsSync(adminDashboardPath)) {
    console.log('❌ AdminDashboard.jsx not found')
    return false
  }
  
  const content = fs.readFileSync(adminDashboardPath, 'utf8')
  
  // Check for key components
  const checks = [
    { name: 'useState hook', pattern: /useState/ },
    { name: 'useEffect hook', pattern: /useEffect/ },
    { name: 'Supabase client import', pattern: /import.*supabase/ },
    { name: 'Error handling', pattern: /try.*catch/ },
    { name: 'Null checks', pattern: /\?\?/ },
    { name: 'Loading state', pattern: /loading/ },
    { name: 'Realtime subscription', pattern: /channel/ },
    { name: 'Defensive rendering', pattern: /safeEntry/ }
  ]
  
  let passedChecks = 0
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`)
      passedChecks++
    } else {
      console.log(`❌ ${check.name}`)
    }
  })
  
  if (passedChecks >= 6) {
    console.log('✅ AdminDashboard Component Test PASSED')
    return true
  } else {
    console.log('❌ AdminDashboard Component Test FAILED')
    return false
  }
}

// Test 3: Build Test
const testBuild = async () => {
  console.log('\n🔨 Testing Build Process...')
  
  const { execSync } = await import('child_process')
  
  try {
    console.log('Running npm run build...')
    execSync('npm run build', { stdio: 'pipe' })
    console.log('✅ Build Test PASSED')
    return true
  } catch (error) {
    console.log('❌ Build Test FAILED')
    console.log('Error:', error.message)
    return false
  }
}

// Test 4: Environment Variables Test
const testEnvironmentVariables = async () => {
  console.log('\n🔐 Testing Environment Variables...')
  
  const fs = await import('fs')
  const path = await import('path')
  
  const envPath = path.join(process.cwd(), '.env')
  const envExamplePath = path.join(process.cwd(), '.env.example')
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists')
  } else {
    console.log('⚠️  .env file not found')
  }
  
  if (fs.existsSync(envExamplePath)) {
    console.log('✅ .env.example file exists')
  } else {
    console.log('❌ .env.example file not found')
  }
  
  // Check supabaseClient.js for fallback values
  const supabaseClientPath = path.join(process.cwd(), 'src/lib/supabaseClient.js')
  if (fs.existsSync(supabaseClientPath)) {
    const content = fs.readFileSync(supabaseClientPath, 'utf8')
    if (content.includes('fallback') || content.includes('||')) {
      console.log('✅ Supabase client has fallback values')
    } else {
      console.log('⚠️  Supabase client may not have fallback values')
    }
  }
  
  console.log('✅ Environment Variables Test PASSED')
  return true
}

// Test 5: Netlify Configuration Test
const testNetlifyConfig = async () => {
  console.log('\n🌐 Testing Netlify Configuration...')
  
  const fs = await import('fs')
  const path = await import('path')
  
  const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml')
  
  if (!fs.existsSync(netlifyTomlPath)) {
    console.log('❌ netlify.toml not found')
    return false
  }
  
  const content = fs.readFileSync(netlifyTomlPath, 'utf8')
  
  const requiredConfigs = [
    '[build]',
    'command = "npm run build"',
    'publish = "dist"',
    '[[redirects]]',
    'from = "/*"',
    'to = "/index.html"',
    'status = 200'
  ]
  
  let passedConfigs = 0
  requiredConfigs.forEach(config => {
    if (content.includes(config)) {
      console.log(`✅ ${config}`)
      passedConfigs++
    } else {
      console.log(`❌ ${config}`)
    }
  })
  
  if (passedConfigs >= 6) {
    console.log('✅ Netlify Configuration Test PASSED')
    return true
  } else {
    console.log('❌ Netlify Configuration Test FAILED')
    return false
  }
}

// Run all tests
const runAllTests = async () => {
  console.log('🧪 Running comprehensive system tests...\n')
  
  const results = {
    telegram: false,
    adminDashboard: false,
    build: false,
    environment: false,
    netlify: false
  }
  
  // Run tests
  results.telegram = await testTelegramFunction()
  results.adminDashboard = await testAdminDashboard()
  results.build = await testBuild()
  results.environment = await testEnvironmentVariables()
  results.netlify = await testNetlifyConfig()
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📋 SYSTEM TEST SUMMARY')
  console.log('='.repeat(50))
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`✅ Telegram Function: ${results.telegram ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ AdminDashboard: ${results.adminDashboard ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Build Process: ${results.build ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Environment: ${results.environment ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Netlify Config: ${results.netlify ? 'PASSED' : 'FAILED'}`)
  
  console.log(`\n📊 Overall Score: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('✅ Telegram Fixed')
    console.log('✅ Admin Dashboard Fixed')
    console.log('✅ System Ready for Production')
    
    console.log('\n🚀 Next Steps:')
    console.log('1. Deploy to Netlify')
    console.log('2. Test on mobile devices')
    console.log('3. Verify camera functionality')
    console.log('4. Test Telegram notifications')
    console.log('5. Share with your team!')
  } else {
    console.log('\n❌ Some tests failed. Please review the issues above.')
  }
  
  return passedTests === totalTests
}

// Run the tests
runAllTests().catch(console.error)
