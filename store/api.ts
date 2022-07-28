import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | undefined

export function getApi() {
  if (!process.client) {
    return null
  }
  const { supabaseUrl, supabaseKey } = useRuntimeConfig().public
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey)
  }
  return supabase
}
