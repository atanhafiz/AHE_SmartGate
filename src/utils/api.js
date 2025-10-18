import { supabase } from '../lib/supabaseClient'

// Upload image to Supabase Storage
export const uploadImage = async (file, bucket = 'selfies') => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (error) {
    return { url: null, error: error.message }
  }
}

// Create storage bucket if it doesn't exist
export const createStorageBucket = async (bucketName) => {
  try {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    })

    if (error && !error.message.includes('already exists')) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Export entries to CSV
export const exportToCSV = (entries) => {
  const headers = ['ID', 'Name', 'Type', 'House Number', 'Entry Type', 'Timestamp', 'Notes']
  const csvContent = [
    headers.join(','),
    ...entries.map(entry => [
      entry.id,
      entry.users?.name || '',
      entry.users?.user_type || '',
      entry.users?.house_number || '',
      entry.entry_type,
      new Date(entry.timestamp).toLocaleString(),
      entry.notes || ''
    ].map(field => `"${field}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `entries-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}
