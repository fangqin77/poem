import { supabase } from './supabaseClient'

export async function searchAll(q, { types = ['poem', 'poet', 'article'], page = 1, pageSize = 20 } = {}) {
  const offset = (page - 1) * pageSize
  const { data, error } = await supabase
    .rpc('search_documents_search', { q, ref_types: types, limit_count: pageSize, offset_count: offset })

  if (error) throw error
  // RPC 未返回总数，这里仅返回结果列表；如需总数，可补充 count RPC 或使用冗余统计
  return data || []
}