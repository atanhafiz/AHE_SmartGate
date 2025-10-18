#!/usr/bin/env node

/**
 * AHE SmartGate v1 - Environment Setup Script
 * Creates .env file with Supabase configuration
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://kpukhpavdxidnoexfljv.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8351952708:AAE9c6am6Lq1ZRj00nb87zwa2X6Znfmoy1A
TELEGRAM_CHAT_ID=-1003119983761

# Supabase Service Role (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc0MzE1NywiZXhwIjoyMDc2MzE5MTU3fQ.o4V5CU70VzhTT4-T6p83Z9S2fkcv3VXpf0HEpFCVHRQ
`

const envPath = path.join(__dirname, '.env')

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('📄 .env file already exists')
    console.log('✅ Environment variables should be loaded')
  } else {
    // Create .env file
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Created .env file with Supabase configuration')
    console.log('📄 Environment variables:')
    console.log('   - VITE_SUPABASE_URL: https://kpukhpavdxidnoexfljv.supabase.co')
    console.log('   - VITE_SUPABASE_KEY: [Present]')
    console.log('   - TELEGRAM_BOT_TOKEN: [Present]')
    console.log('   - TELEGRAM_CHAT_ID: [Present]')
  }
  
  console.log('\n🚀 Ready to start development server:')
  console.log('   npm run dev')
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message)
  console.log('\n📝 Manual setup:')
  console.log('1. Create .env file in project root')
  console.log('2. Add the following content:')
  console.log(envContent)
}
