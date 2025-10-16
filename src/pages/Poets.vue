<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">诗人列表</h1>
      <div v-if="loading" class="text-gray-500">加载中…</div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <RouterLink
          v-for="p in items"
          :key="p.id"
          class="text-center group"
          :to="`/poets/${p.id}`"
        >
          <div class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
            <img :src="p.avatar || defaultAvatar" :alt="p.name" class="w-full h-full object-cover" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 group-hover:text-blue-600">{{ p.name }}</h3>
          <p class="text-gray-600">{{ p.dynasty || '' }}</p>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listPoets } from '@/services/poets'

const items = ref([])
const loading = ref(true)
const defaultAvatar = 'https://ai-public.mastergo.com/ai/img_res/7c36e7c2db897b4f45516737d34b668b.jpg'

onMounted(async () => {
  loading.value = true
  try {
    const { items: rows } = await listPoets({ page: 1, pageSize: 40 })
    items.value = rows
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
})
</script>