import { supabase } from './supabaseClient'

async function getUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data?.user?.id || null
}

export async function addFavorite(poemId) {
  const userId = await getUserId()
  if (!userId) throw new Error('未登录，无法收藏')

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, poem_id: poemId })
  if (error) throw error
  return true
}

export async function removeFavorite(poemId) {
  const userId = await getUserId()
  if (!userId) throw new Error('未登录，无法取消收藏')

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('poem_id', poemId)

  if (error) throw error
  return true
}

export async function isFavorited(poemId) {
  const userId = await getUserId()
  if (!userId) return false

  const { data, error, count } = await supabase
    .from('favorites')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('poem_id', poemId)

  if (error) throw error
  return (count || 0) > 0
}

export async function listMyFavorites({ page = 1, pageSize = 20 } = {}) {
  const userId = await getUserId()
  if (!userId) throw new Error('未登录，无法获取收藏列表')

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // 仅返回 poem_id 与时间，页面可再批量查询详情
  const { data, error, count } = await supabase
    .from('favorites')
    .select('poem_id, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { items: data || [], total: count || 0, page, pageSize }
}