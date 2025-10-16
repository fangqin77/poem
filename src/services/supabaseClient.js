import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // 建议在项目根目录创建 .env.development 或 .env.local：
  // VITE_SUPABASE_URL=...
  // VITE_SUPABASE_ANON_KEY=...
  console.warn('Supabase 环境变量未设置：VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
}

// 仅在变量齐全时创建客户端；否则导出 null，避免应用启动时崩溃
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null