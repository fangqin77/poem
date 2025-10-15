import { supabase } from './supabaseClient'

export async function listPoems({ page = 1, pageSize = 20, poetId } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('v_poem_with_categories')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (poetId) {
    query = query.eq('poet_id', poetId)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { items: data || [], total: count || 0, page, pageSize }
}

export async function getPoem(id) {
  const { data, error } = await supabase
    .from('v_poem_with_categories')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}