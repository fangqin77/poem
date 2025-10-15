import { supabase } from './supabaseClient'

export async function listCategories() {
  const { data, error } = await supabase.from('categories').select('id,name,slug,description').order('name', { ascending: true })
  if (error) throw error
  return data || []
}