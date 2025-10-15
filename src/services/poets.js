import { supabase } from './supabaseClient'

export async function listPoets({ page = 1, pageSize = 20, dynasty, q } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('poets').select('*', { count: 'exact' }).order('name', { ascending: true }).range(from, to)
  if (dynasty) query = query.eq('dynasty', dynasty)
  if (q) {
    // 简单标题模糊匹配（也可改为 RPC 搜索）
    query = query.ilike('name', `%${q}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { items: data || [], total: count || 0, page, pageSize }
}

export async function getPoet(id) {
  const { data, error } = await supabase.from('poets').select('*').eq('id', id).single()
  if (error) throw error
  return data
}