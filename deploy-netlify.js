#!/usr/bin/env node

/**
 * AHE SmartGate v1 - Netlify Deployment Helper
 * Builds the project and provides deployment instructions
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

console.log('🚀 AHE SmartGate v1 - Netlify Deployment Helper')
console.log('===============================================\n')

try {
  // Step 1: Build the project
  console.log('📦 Building project...')
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build completed successfully\n')

  // Step 2: Check build output
  const distPath = path.join(process.cwd(), 'dist')
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath)
    console.log('📁 Build output:')
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

  console.log('\n🎯 Deployment Options:')
  console.log('======================')
  
  console.log('\n📋 Option A: Manual Deploy (Quickest)')
  console.log('1. Go to https://app.netlify.com/drop')
  console.log('2. Drag the "dist" folder to the drop zone')
  console.log('3. Your site will be live in seconds!')
  
  console.log('\n📋 Option B: Git Deploy (Recommended)')
  console.log('1. Push your code to GitHub')
  console.log('2. Go to https://app.netlify.com')
  console.log('3. Click "Add new site from Git"')
  console.log('4. Select your repository')
  console.log('5. Configure:')
  console.log('   - Build command: npm run build')
  console.log('   - Publish directory: dist')
  console.log('6. Add environment variables (see NETLIFY_DEPLOYMENT.md)')
  
  console.log('\n🔧 Environment Variables to Add:')
  console.log('================================')
  console.log('VITE_SUPABASE_URL=https://kpukhpavdxidnoexfljv.supabase.co')
  console.log('VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  console.log('TELEGRAM_BOT_TOKEN=8351952708:AAE9c6am6Lq1ZRj00nb87zwa2X6Znfmoy1A')
  console.log('TELEGRAM_CHAT_ID=-1003119983761')
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  
  console.log('\n✅ Ready for deployment!')
  console.log('📖 See NETLIFY_DEPLOYMENT.md for detailed instructions')
  
} catch (error) {
  console.error('❌ Build failed:', error.message)
  console.log('\n🔧 Troubleshooting:')
  console.log('1. Make sure all dependencies are installed: npm install')
  console.log('2. Check for any TypeScript/ESLint errors')
  console.log('3. Verify all environment variables are set')
  process.exit(1)
}
