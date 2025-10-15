import { supabase } from './supabaseClient'

async function getUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data?.user?.id || null
}

export async function addComment(poemId, content) {
  const userId = await getUserId()
  if (!userId) throw new Error('未登录，无法发表评论')
  if (!content || !content.trim()) throw new Error('评论内容不能为空')

  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, poem_id: poemId, content })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateComment(commentId, content) {
  const userId = await getUserId()
  if (!userId) throw new Error('未登录，无法编辑评论')
  if (!content || !content.trim()) throw new Error('评论内容不能为空')

  // RLS 要求作者本人才能更新
  const { data, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function deleteComment(commentId) {
  const userId = await getUserId()
  if (!userId) throw new Error('未登录，无法删除评论')

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)

  if (error) throw error
  return true
}

export async function listCommentsByPoem(poemId, { page = 1, pageSize = 20 } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('comments')
    .select('*', { count: 'exact' })
    .eq('poem_id', poemId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { items: data || [], total: count || 0, page, pageSize }
}