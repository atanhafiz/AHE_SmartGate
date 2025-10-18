#!/usr/bin/env node

/**
 * AHE SmartGate v1 - Netlify Routing Fix Verification
 * Ensures React Router fallback is properly configured for Netlify
 */

import fs from 'fs'
import path from 'path'

console.log('🔧 AHE SmartGate v1 - Netlify Routing Fix Verification')
console.log('=======================================================\n')

let allGood = true

// Step 1: Verify folder structure
console.log('📁 Checking folder structure:')
const requiredFiles = [
  'netlify.toml',
  'package.json',
  'vite.config.js',
  'dist/index.html'
]

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - Missing`)
    allGood = false
  }
})

// Step 2: Verify netlify.toml content
console.log('\n📄 Checking netlify.toml configuration:')
const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml')
if (fs.existsSync(netlifyTomlPath)) {
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
  
  requiredConfigs.forEach(config => {
    if (content.includes(config)) {
      console.log(`✅ ${config}`)
    } else {
      console.log(`❌ ${config} - Missing`)
      allGood = false
    }
  })
} else {
  console.log('❌ netlify.toml not found')
  allGood = false
}

// Step 3: Verify build output
console.log('\n📦 Checking build output:')
const distPath = path.join(process.cwd(), 'dist')
if (fs.existsSync(distPath)) {
  console.log('✅ dist/ directory exists')
  
  const indexHtmlPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexHtmlPath)) {
    console.log('✅ index.html exists')
    
    // Check if index.html contains React app
    const indexContent = fs.readFileSync(indexHtmlPath, 'utf8')
    if (indexContent.includes('<div id="root"></div>')) {
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
    
    // Check for required assets
    const hasJS = assets.some(file => file.endsWith('.js'))
    const hasCSS = assets.some(file => file.endsWith('.css'))
    
    if (hasJS) {
      console.log('✅ JavaScript bundle found')
    } else {
      console.log('❌ JavaScript bundle missing')
      allGood = false
    }
    
    if (hasCSS) {
      console.log('✅ CSS bundle found')
    } else {
      console.log('❌ CSS bundle missing')
      allGood = false
    }
  } else {
    console.log('❌ assets/ directory missing')
    allGood = false
  }
} else {
  console.log('❌ dist/ directory not found - run npm run build')
  allGood = false
}

// Step 4: Verify package.json scripts
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

// Final result
console.log('\n' + '='.repeat(60))
if (allGood) {
  console.log('🎉 Netlify Routing Fix Verification PASSED!')
  console.log('✅ React Router fallback properly configured')
  console.log('✅ Fresh build completed successfully')
  console.log('✅ Ready for Netlify deployment')
  
  console.log('\n📋 Deployment Steps:')
  console.log('1. Go to https://app.netlify.com/drop')
  console.log('2. Drag the ENTIRE "dist" folder to the drop zone')
  console.log('3. Wait for deployment to complete')
  console.log('4. Test all routes: /, /register, /guard, /admin')
  console.log('5. Verify no 404 errors on page refresh')
  
  console.log('\n🔧 If you still get 404 errors:')
  console.log('1. Go to Netlify Dashboard → Deploys')
  console.log('2. Click "Clear cache and redeploy site"')
  console.log('3. Wait for new deployment')
  console.log('4. Test routes again')
  
  console.log('\n✅ Expected Results:')
  console.log('- All routes work without 404 errors')
  console.log('- Page refresh works on all routes')
  console.log('- React Router handles client-side routing')
  console.log('- Netlify serves index.html for all routes')
  
} else {
  console.log('❌ Netlify Routing Fix Verification FAILED!')
  console.log('🔧 Fix the issues above before deploying')
  process.exit(1)
}

console.log('\n📖 For detailed instructions, see NETLIFY_DEPLOYMENT.md')
