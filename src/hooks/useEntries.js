import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useEntries = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('entries')
        .select(`
          *,
          users (
            name,
            user_type,
            house_number
          )
        `)
        .order('timestamp', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()

    // Set up realtime subscription
    const subscription = supabase
      .channel('entries_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'entries' },
        () => {
          fetchEntries() // Refetch when entries change
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const addEntry = async (entryData) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([entryData])
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const addUser = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return {
    entries,
    loading,
    error,
    addEntry,
    addUser,
    refetch: fetchEntries,
  }
}
