<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">诗词分类</h1>
      <p class="text-gray-600 mb-8">根据分类浏览诗词（支持 ?type=tang|song|yuan|gufeng|modern）。</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="it in items"
          :key="it.id"
          class="block p-6 rounded-xl border bg-white hover:shadow transition"
          :to="`/poems/${it.id}`"
        >
          <h3 class="font-semibold text-gray-800">{{ it.title }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ it.poet_name || '佚名' }} <span v-if="it.dynasty">· {{ it.dynasty }}</span></p>
          <p class="text-gray-600 mt-3 line-clamp-2 whitespace-pre-line">{{ (it.content || '').slice(0, 80) }}</p>
        </RouterLink>
      </div>

      <div v-if="!loading && !items.length" class="text-gray-500 mt-6">暂无数据</div>
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
  // 简单映射：tang/song/yuan 按 dynasty 过滤；其他类型显示最新
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
    let query = supabase.from('v_poem_with_categories').select('*').order('created_at', { ascending: false }).limit(30)
    if (filter.dynasty) query = query.eq('dynasty', filter.dynasty)
    const { data, error } = await query
    items.value = (!error && data) ? data : []
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
})
</script>