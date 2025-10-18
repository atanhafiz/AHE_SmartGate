// Telegram utility functions for frontend
// Note: Actual Telegram notifications are handled by the Supabase Edge Function

export const formatTelegramMessage = (entry) => {
  const { users, entry_type, timestamp, notes } = entry
  const name = users?.name || 'Unknown'
  const houseNumber = users?.house_number || 'N/A'
  const time = new Date(timestamp).toLocaleString()
  
  return `🚪 *New Entry Detected*
Name: ${name}
House: ${houseNumber}
Type: ${entry_type}
Time: ${time}
${notes ? `Notes: ${notes}` : ''}`
}

export const validateTelegramConfig = () => {
  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.TELEGRAM_CHAT_ID
  
  return {
    isValid: !!(botToken && chatId),
    missing: [
      !botToken && 'TELEGRAM_BOT_TOKEN',
      !chatId && 'TELEGRAM_CHAT_ID'
    ].filter(Boolean)
  }
}
