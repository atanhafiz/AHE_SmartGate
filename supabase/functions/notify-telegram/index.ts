import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Allow public access - no JWT verification required
  console.log('Public access request received')

  try {
    const payload = await req.json()
    console.log('📦 Received payload:', payload)
    
    // Get environment variables
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram configuration')
      return new Response(
        JSON.stringify({ error: 'Telegram configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle both old and new payload formats
    const name = payload.name || payload.record?.users?.name || 'Unknown'
    const houseNumber = payload.house_number || payload.record?.users?.house_number || 'N/A'
    const entryType = payload.entry_type || payload.record?.entry_type || 'normal'
    const timestamp = payload.timestamp || payload.record?.timestamp || new Date().toISOString()
    const notes = payload.notes || payload.record?.notes || ''
    const selfieUrl = payload.selfie_url || payload.record?.selfie_url

    // Format the message
    const message = `🚪 *New Entry Detected*
Name: ${name}
House: ${houseNumber}
Type: ${entryType === 'forced_by_guard' ? 'Forced Entry' : 'Normal Entry'}
Time: ${new Date(timestamp).toLocaleString()}
${notes ? `Notes: ${notes}` : ''}`

    // Send text message
    console.log('Sending Telegram message...')
    const textResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    const textResult = await textResponse.json()
    console.log('Telegram text response:', textResult)

    if (!textResponse.ok) {
      console.error('Failed to send text message:', textResult)
    } else {
      console.log('✅ Telegram message sent successfully')
    }

    // Send photo if available
    if (selfieUrl) {
      console.log('Sending Telegram photo...')
      try {
        const formData = new FormData()
        formData.append('chat_id', TELEGRAM_CHAT_ID)
        formData.append('photo', selfieUrl)
        formData.append('caption', `Entry photo for ${name}`)
        
        const photoResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
          {
            method: 'POST',
            body: formData,
          }
        )

        const photoResult = await photoResponse.json()
        console.log('Telegram photo response:', photoResult)

        if (!photoResponse.ok) {
          console.error('Failed to send photo:', photoResult)
        } else {
          console.log('✅ Telegram photo sent successfully')
        }
      } catch (photoError) {
        console.error('Error sending photo:', photoError)
        // Continue execution even if photo fails
      }
    } else {
      console.log('No photo URL provided, skipping photo send')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in notify-telegram function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
