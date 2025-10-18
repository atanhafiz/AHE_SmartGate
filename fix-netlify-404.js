#!/usr/bin/env node

/**
 * AHE SmartGate v1 - Netlify 404 Fix Verification
 * Ensures React Router fallback is properly configured
 */

import fs from 'fs'
import path from 'path'

console.log('🔧 AHE SmartGate v1 - Netlify 404 Fix Verification')
console.log('==================================================\n')

let allGood = true

// Check netlify.toml
console.log('📄 Checking netlify.toml configuration:')
const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml')
if (fs.existsSync(netlifyTomlPath)) {
  const content = fs.readFileSync(netlifyTomlPath, 'utf8')
  
  if (content.includes('[build]')) {
    console.log('✅ [build] section found')
  } else {
    console.log('❌ [build] section missing')
    allGood = false
  }
  
  if (content.includes('command = "npm run build"')) {
    console.log('✅ Build command configured')
  } else {
    console.log('❌ Build command not configured')
    allGood = false
  }
  
  if (content.includes('publish = "dist"')) {
    console.log('✅ Publish directory set to dist')
  } else {
    console.log('❌ Publish directory not set')
    allGood = false
  }
  
  if (content.includes('[[redirects]]')) {
    console.log('✅ Redirects section found')
  } else {
    console.log('❌ Redirects section missing')
    allGood = false
  }
  
  if (content.includes('from = "/*"')) {
    console.log('✅ Catch-all redirect configured')
  } else {
    console.log('❌ Catch-all redirect missing')
    allGood = false
  }
  
  if (content.includes('to = "/index.html"')) {
    console.log('✅ Fallback to index.html configured')
  } else {
    console.log('❌ Fallback to index.html missing')
    allGood = false
  }
  
  if (content.includes('status = 200')) {
    console.log('✅ Status 200 configured')
  } else {
    console.log('❌ Status 200 missing')
    allGood = false
  }
} else {
  console.log('❌ netlify.toml file not found')
  allGood = false
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts:')
const packageJsonPath = path.join(process.cwd(), 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const scripts = packageJson.scripts || {}
  
  if (scripts.build === 'vite build') {
    console.log('✅ Build script: vite build')
  } else {
    console.log('❌ Build script incorrect:', scripts.build)
    allGood = false
  }
  
  if (scripts.preview === 'vite preview') {
    console.log('✅ Preview script: vite preview')
  } else {
    console.log('❌ Preview script incorrect:', scripts.preview)
    allGood = false
  }
} else {
  console.log('❌ package.json not found')
  allGood = false
}

// Check dist folder
console.log('\n📁 Checking build output:')
const distPath = path.join(process.cwd(), 'dist')
if (fs.existsSync(distPath)) {
  console.log('✅ dist/ directory exists')
  
  const indexHtmlPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexHtmlPath)) {
    console.log('✅ index.html exists')
    
    // Check if index.html contains React app
    const indexContent = fs.readFileSync(indexHtmlPath, 'utf8')
    if (indexContent.includes('root')) {
      console.log('✅ React app root element found')
    } else {
      console.log('❌ React app root element missing')
      allGood = false
    }
  } else {
    console.log('❌ index.html missing')
    allGood = false
  }
  
  const assetsPath = path.join(distPath, 'assets')
  if (fs.existsSync(assetsPath)) {
    console.log('✅ assets/ directory exists')
    const assets = fs.readdirSync(assetsPath)
    console.log(`   📄 ${assets.length} asset files found`)
  } else {
    console.log('❌ assets/ directory missing')
    allGood = false
  }
} else {
  console.log('❌ dist/ directory not found - run npm run build')
  allGood = false
}

// Final result
console.log('\n' + '='.repeat(60))
if (allGood) {
  console.log('🎉 Netlify 404 Fix Verification PASSED!')
  console.log('✅ React Router fallback properly configured')
  console.log('✅ Ready for Netlify deployment')
  
  console.log('\n📋 Next Steps:')
  console.log('1. Go to https://app.netlify.com/drop')
  console.log('2. Drag the "dist" folder to the drop zone')
  console.log('3. Wait for deployment to complete')
  console.log('4. Test all routes: /, /register, /guard, /admin')
  console.log('5. Verify no 404 errors on page refresh')
  
  console.log('\n🔧 If you still get 404 errors:')
  console.log('1. Check that netlify.toml is in the root directory')
  console.log('2. Ensure the redirects section is exactly as shown')
  console.log('3. Redeploy after making changes')
  
} else {
  console.log('❌ Netlify 404 Fix Verification FAILED!')
  console.log('🔧 Fix the issues above before deploying')
  process.exit(1)
}

console.log('\n📖 For detailed instructions, see NETLIFY_DEPLOYMENT.md')
