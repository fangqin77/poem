import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // 建议在项目根目录创建 .env 或 .env.local 文件设置以下变量：
  // VITE_SUPABASE_URL=...
  // VITE_SUPABASE_ANON_KEY=...
  console.warn('Supabase 环境变量未设置：VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})