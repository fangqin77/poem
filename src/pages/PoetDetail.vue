<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <section class="mb-10">
        <div class="flex items-start gap-6">
          <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow">
            <img :src="poet?.avatar || defaultAvatar" :alt="poet?.name || ('诗人 #' + id)" class="w-full h-full object-cover" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
              {{ poet?.name || ('诗人详情 #' + id) }}
            </h1>
            <p class="text-gray-600" v-if="poet?.dynasty">
              {{ poet.dynasty }}
            </p>
            <p class="text-gray-500" v-else>生平简介与代表作（占位）。</p>
          </div>
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800">TA 的诗词</h2>
          <span class="text-sm text-gray-500" v-if="total > 0">共 {{ total }} 首</span>
        </div>

        <div v-if="loading" class="text-gray-500">加载中…</div>
        <div v-else>
          <div v-if="items.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RouterLink
              v-for="it in items"
              :key="it.id"
              class="block bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition"
              :to="`/poems/${it.id}`"
            >
              <h3 class="text-lg font-semibold text-gray-800">{{ it.title }}</h3>
              <p class="text-gray-600 mt-1">
                <span>{{ it.poet_name || '佚名' }}</span>
                <span v-if="it.dynasty"> · {{ it.dynasty }}</span>
              </p>
              <p class="text-gray-700 line-clamp-2 mt-3 whitespace-pre-line">{{ (it.content || '').slice(0, 80) }}</p>
            </RouterLink>
          </div>
          <div v-else class="text-gray-500">暂无该诗人的作品</div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPoet } from '@/services/poets'
import { listPoems } from '@/services/poems'

const id = useRoute().params.id
const poet = ref(null)
const items = ref([])
const total = ref(0)
const loading = ref(true)
const defaultAvatar = 'https://ai-public.mastergo.com/ai/img_res/7c36e7c2db897b4f45516737d34b668b.jpg'

onMounted(async () => {
  loading.value = true
  try {
    poet.value = await getPoet(id)
  } catch {
    poet.value = null
  }
  try {
    const { items: rows, total: t } = await listPoems({ page: 1, pageSize: 30, poetId: id })
    items.value = rows
    total.value = t
  } catch {
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
})
</script>