import { supabase } from './supabaseClient'

export async function listArticles({ page = 1, pageSize = 20 } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('articles')
    .select('id,title,slug,summary,author,published_at,created_at', { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(from, to)

  if (error) throw error
  return { items: data || [], total: count || 0, page, pageSize }
}

export async function getArticleById(id) {
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function getArticleBySlug(slug) {
  const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).single()
  if (error) throw error
  return data
}