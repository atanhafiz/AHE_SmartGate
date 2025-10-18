import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kpukhpavdxidnoexfljv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s'

// Check if we're using fallback values
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY) {
  console.warn('⚠️ Using fallback Supabase configuration. Create .env file for production.')
  console.warn('Create .env file with:')
  console.warn('VITE_SUPABASE_URL=https://kpukhpavdxidnoexfljv.supabase.co')
  console.warn('VITE_SUPABASE_KEY=your_anon_key_here')
}

console.log('🔍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('🔍 Supabase Key:', import.meta.env.VITE_SUPABASE_KEY ? '[Present]' : '[Missing]')
console.log('✅ Supabase connected:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
