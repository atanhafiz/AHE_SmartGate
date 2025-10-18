#!/usr/bin/env node

/**
 * AHE SmartGate v1 - Build Verification Script
 * Verifies that the production build is ready for deployment
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 AHE SmartGate v1 - Build Verification')
console.log('========================================\n')

const distPath = path.join(process.cwd(), 'dist')
const requiredFiles = [
  'index.html',
  'assets/index-0b5dd1d9.js',
  'assets/index-c030e88e.css'
]

let allGood = true

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.log('❌ dist/ directory not found')
  console.log('   Run: npm run build')
  allGood = false
} else {
  console.log('✅ dist/ directory exists')
}

// Check required files
console.log('\n📁 Checking required files:')
requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file)
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    const size = (stats.size / 1024).toFixed(2)
    console.log(`✅ ${file} (${size} KB)`)
  } else {
    console.log(`❌ ${file} - Missing`)
    allGood = false
  }
})

// Check for React Router redirects
const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml')
if (fs.existsSync(netlifyTomlPath)) {
  console.log('\n✅ netlify.toml exists')
  const content = fs.readFileSync(netlifyTomlPath, 'utf8')
  if (content.includes('[[redirects]]')) {
    console.log('✅ React Router redirects configured')
  } else {
    console.log('❌ React Router redirects missing')
    allGood = false
  }
} else {
  console.log('\n❌ netlify.toml missing')
  allGood = false
}

// Check package.json scripts
const packageJsonPath = path.join(process.cwd(), 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const scripts = packageJson.scripts || {}
  
  console.log('\n📦 Checking package.json scripts:')
  if (scripts.build) {
    console.log(`✅ build: ${scripts.build}`)
  } else {
    console.log('❌ build script missing')
    allGood = false
  }
  
  if (scripts.preview) {
    console.log(`✅ preview: ${scripts.preview}`)
  } else {
    console.log('❌ preview script missing')
    allGood = false
  }
}

// Final result
console.log('\n' + '='.repeat(50))
if (allGood) {
  console.log('🎉 Build verification PASSED!')
  console.log('✅ Ready for Netlify deployment')
  console.log('\n📋 Next steps:')
  console.log('1. Run: node deploy-netlify.js')
  console.log('2. Follow deployment instructions')
  console.log('3. Add environment variables in Netlify')
} else {
  console.log('❌ Build verification FAILED!')
  console.log('🔧 Fix the issues above before deploying')
  process.exit(1)
}
