<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">诗词分类</h1>
      <p class="text-gray-600 mb-8">根据分类浏览诗词（支持 ?type=tang|song|yuan|gufeng|modern）。</p>

      <div v-if="loading" class="text-gray-500">加载中…</div>
      <template v-else>
        <div v-if="items.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RouterLink
            v-for="it in items"
            :key="it.id"
            class="block p-6 rounded-xl border bg-white hover:shadow transition"
            :to="{ name: 'poem-detail', params: { id: it.id } }"
          >
            <h3 class="font-semibold text-gray-800">{{ it.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ it.poet_name || '佚名' }} <span v-if="it.dynasty">· {{ it.dynasty }}</span></p>
            <p class="text-gray-600 mt-3 line-clamp-2 whitespace-pre-line">{{ (it.content || '').slice(0, 80) }}</p>
          </RouterLink>
        </div>
        <div v-else class="text-gray-500">
          暂无匹配的诗词数据
          <div class="mt-4">
            <RouterLink to="/" class="inline-block rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
              返回首页
            </RouterLink>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabaseClient'

const route = useRoute()
const items = ref([])
const loading = ref(false)

function typeToFilter(t) {
  if (t === 'tang') return { dynasty: '唐' }
  if (t === 'song') return { dynasty: '宋' }
  if (t === 'yuan') return { dynasty: '元' }
  return {}
}

watchEffect(async () => {
  const t = (route.query.type || '').toString()
  const filter = typeToFilter(t)
  loading.value = true
  try {
    // 先查视图
    let query = supabase.from('v_poem_with_categories').select('*').order('created_at', { ascending: false }).limit(30)
    if (filter.dynasty) query = query.eq('dynasty', filter.dynasty)
    let { data, error } = await query

    // 兜底：若视图无数据，退回查 poems 表
    if ((!data || !data.length) || error) {
      let q2 = supabase.from('poems').select('id,title,poet_name,dynasty,content').order('created_at', { ascending: false }).limit(30)
      if (filter.dynasty) q2 = q2.eq('dynasty', filter.dynasty)
      const r2 = await q2
      data = r2.data || []
    }

    items.value = data || []
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
})
</script>