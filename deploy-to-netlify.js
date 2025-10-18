#!/usr/bin/env node

/**
 * AHE SmartGate v1 - Quick Netlify Deployment Helper
 * Builds and prepares for Netlify deployment
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 AHE SmartGate v1 - Quick Netlify Deployment')
console.log('==============================================\n')

try {
  // Step 1: Build the project
  console.log('📦 Building project...')
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build completed successfully\n')

  // Step 2: Verify build output
  const distPath = path.join(process.cwd(), 'dist')
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath)
    console.log('📁 Build output verified:')
    files.forEach(file => {
      const filePath = path.join(distPath, file)
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        console.log(`   📁 ${file}/`)
        const subFiles = fs.readdirSync(filePath)
        subFiles.forEach(subFile => {
          const subFilePath = path.join(filePath, subFile)
          const subStats = fs.statSync(subFilePath)
          const size = (subStats.size / 1024).toFixed(2)
          console.log(`      📄 ${subFile} (${size} KB)`)
        })
      } else {
        const size = (stats.size / 1024).toFixed(2)
        console.log(`   📄 ${file} (${size} KB)`)
      }
    })
  }

  // Step 3: Verify netlify.toml
  const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml')
  if (fs.existsSync(netlifyTomlPath)) {
    console.log('\n✅ netlify.toml configuration verified')
    const content = fs.readFileSync(netlifyTomlPath, 'utf8')
    if (content.includes('[[redirects]]') && content.includes('from = "/*"')) {
      console.log('✅ React Router fallback configured')
    }
  }

  console.log('\n🎯 Ready for Netlify Deployment!')
  console.log('================================')
  
  console.log('\n📋 Manual Deployment Steps:')
  console.log('1. Go to https://app.netlify.com/drop')
  console.log('2. Drag the "dist" folder to the drop zone')
  console.log('3. Wait for deployment to complete')
  console.log('4. Test all routes: /, /register, /guard, /admin')
  
  console.log('\n🔧 Environment Variables to Add in Netlify:')
  console.log('==========================================')
  console.log('VITE_SUPABASE_URL=https://kpukhpavdxidnoexfljv.supabase.co')
  console.log('VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  console.log('TELEGRAM_BOT_TOKEN=8351952708:AAE9c6am6Lq1ZRj00nb87zwa2X6Znfmoy1A')
  console.log('TELEGRAM_CHAT_ID=-1003119983761')
  
  console.log('\n✅ Expected Results:')
  console.log('- All routes work without 404 errors')
  console.log('- Page refresh works on all routes')
  console.log('- Camera access works (HTTPS required)')
  console.log('- Supabase integration works')
  console.log('- Telegram notifications work')
  
  console.log('\n🎉 Deployment ready! Your AHE SmartGate v1 will be live soon!')
  
} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message)
  console.log('\n🔧 Troubleshooting:')
  console.log('1. Make sure all dependencies are installed: npm install')
  console.log('2. Check for any build errors above')
  console.log('3. Verify netlify.toml is in the root directory')
  process.exit(1)
}
