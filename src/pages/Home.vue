<template>
  <div>
    <!-- Hero Section -->
    <div class="w-full pt-20 pb-16 min-h-[60vh] md:min-h-[65vh] lg:min-h-[70vh] bg-cover bg-center" style="background-image: url('https://ai-public.mastergo.com/ai/img_res/7c82ef792e418db1d63419ebe13e4366.jpg');">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-4">品读千年诗词，感悟文字之美</h1>
        <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">在这里，与古代文人墨客对话，探索中华诗词的无穷韵味</p>
        <RouterLink to="/categories" class="inline-block !rounded-button whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 transition duration-300">
          开始探索
        </RouterLink>
      </div>
    </div>

    <!-- Featured Poems（动态：按标题拉取 uuid） -->
    <section class="py-16 bg-white">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">精选诗词</h2>
        <div v-if="featuredPoemsLoading" class="text-center text-gray-500">加载中…</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <RouterLink
            v-for="fp in featuredPoems"
            :key="fp.id"
            class="block bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            :to="`/poems/${fp.id}`"
          >
            <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ fp.title }}</h3>
            <p class="text-gray-600 mb-1">{{ fp.poet_name || '佚名' }} <span v-if="fp.dynasty">· {{ fp.dynasty }}</span></p>
            <p class="text-gray-700 italic mt-4 line-clamp-3 whitespace-pre-line">{{ (fp.content || '').slice(0, 80) }}</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 最新诗词（动态，支持“已收藏”标记与只看收藏） -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">最新诗词</h2>
          <label class="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" v-model="onlyFav" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
            只看收藏
          </label>
        </div>

        <div v-if="loading" class="text-gray-500">加载中…</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RouterLink
            v-for="item in filteredItems"
            :key="item.id"
            class="block bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition"
            :to="`/poems/${item.id}`"
          >
            <div class="flex items-start justify-between">
              <h3 class="text-lg font-semibold text-gray-800">{{ item.title }}</h3>
              <span
                v-if="favSet.has(item.id)"
                class="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-700"
              >
                已收藏
              </span>
            </div>
            <p class="text-gray-600 mt-1">
              <span>{{ item.poet_name || '佚名' }}</span>
              <span v-if="item.dynasty"> · {{ item.dynasty }}</span>
            </p>
            <p class="text-gray-700 line-clamp-2 mt-3 whitespace-pre-line">{{ (item.content || '').slice(0, 80) }}</p>
          </RouterLink>
        </div>

        <div class="text-center mt-8">
          <button
            class="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            :disabled="loadingMore || !hasMore"
            @click="loadMore"
          >
            {{ loadingMore ? '加载中…' : (hasMore ? '加载更多' : '没有更多了') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">诗词分类</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8">
          <RouterLink to="/categories?type=tang" class="flex flex-col items-center group">
            <div class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <img src="https://ai-public.mastergo.com/ai/img_res/bf704c9f3f17827303ef4cab263388e8.jpg" alt="唐诗" class="w-12 h-12">
            </div>
            <span class="text-gray-700 font-medium group-hover:text-blue-600">唐诗</span>
          </RouterLink>
          <RouterLink to="/categories?type=song" class="flex flex-col items-center group">
            <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <img src="https://ai-public.mastergo.com/ai/img_res/fd50175b2ce2b961988dbb29da21d38d.jpg" alt="宋词" class="w-12 h-12">
            </div>
            <span class="text-gray-700 font-medium group-hover:text-blue-600">宋词</span>
          </RouterLink>
          <RouterLink to="/categories?type=yuan" class="flex flex-col items-center group">
            <div class="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <img src="https://ai-public.mastergo.com/ai/img_res/9d846d29f0e598481083be7b76ab677a.jpg" alt="元曲" class="w-12 h-12">
            </div>
            <span class="text-gray-700 font-medium group-hover:text-blue-600">元曲</span>
          </RouterLink>
          <RouterLink to="/categories?type=gufeng" class="flex flex-col items-center group">
            <div class="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <img src="https://ai-public.mastergo.com/ai/img_res/e9f4d79884121905add1d86fbbb314df.jpg" alt="古风" class="w-12 h-12">
            </div>
            <span class="text-gray-700 font-medium group-hover:text-blue-600">古风</span>
          </RouterLink>
          <RouterLink to="/categories?type=modern" class="flex flex-col items-center group">
            <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <img src="https://ai-public.mastergo.com/ai/img_res/ef06316b316eea00c8930e2da083b7ee.jpg" alt="现代诗" class="w-12 h-12">
            </div>
            <span class="text-gray-700 font-medium group-hover:text-blue-600">现代诗</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Poets（动态：按姓名拉取 uuid） -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">诗人介绍</h2>
        <div v-if="featuredPoetsLoading" class="text-center text-gray-500">加载中…</div>
        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <RouterLink
            v-for="pt in featuredPoets"
            :key="pt.id"
            class="text-center group"
            :to="`/poets/${pt.id}`"
          >
            <div class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
              <img :src="pt.avatar || defaultPoetAvatar" :alt="pt.name" class="w-full h-full object-cover" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800 group-hover:text-blue-600">{{ pt.name }}</h3>
            <p class="text-gray-600">{{ pt.dynasty || '' }}</p>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabaseClient'

const pageSize = 12
const items = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const page = ref(1)
const hasMore = ref(true)

const userId = ref(null)
const favSet = ref(new Set())
const onlyFav = ref(false)

const filteredItems = computed(() => {
  if (!onlyFav.value) return items.value
  return items.value.filter(it => favSet.value.has(it.id))
})

// Featured (动态) ---------------------------------
const featuredPoemsLoading = ref(true)
const featuredPoetsLoading = ref(true)
const featuredPoems = ref([])
const featuredPoets = ref([])

const defaultPoetAvatar = 'https://ai-public.mastergo.com/ai/img_res/7c36e7c2db897b4f45516737d34b668b.jpg'

// 需要展示的固定标题/姓名，但以数据库真实 uuid 跳转
const featuredPoemTitles = ['静夜思', '水调歌头·明月几时有', '春晓', '念奴娇·赤壁怀古']
const featuredPoetNames = ['李白', '杜甫', '苏轼', '李清照']

async function loadFeaturedPoems() {
  featuredPoemsLoading.value = true
  try {
    const { data, error } = await supabase
      .from('v_poem_with_categories')
      .select('id,title,poet_name,dynasty,content')
      .in('title', featuredPoemTitles)
    if (!error && data) {
      // 保持标题顺序
      const map = new Map(data.map(d => [d.title, d]))
      featuredPoems.value = featuredPoemTitles.map(t => map.get(t)).filter(Boolean)
    } else {
      featuredPoems.value = []
    }
  } catch {
    featuredPoems.value = []
  } finally {
    featuredPoemsLoading.value = false
  }
}

async function loadFeaturedPoets() {
  featuredPoetsLoading.value = true
  try {
    const { data, error } = await supabase
      .from('poets')
      .select('id,name,dynasty,avatar')
      .in('name', featuredPoetNames)
    if (!error && data) {
      const map = new Map(data.map(d => [d.name, d]))
      featuredPoets.value = featuredPoetNames.map(n => map.get(n)).filter(Boolean)
    } else {
      featuredPoets.value = []
    }
  } catch {
    featuredPoets.value = []
  } finally {
    featuredPoetsLoading.value = false
  }
}

// Auth & 收藏 -------------------------------------
async function loadUser() {
  if (!supabase) { userId.value = null; return }
  try {
    const { data } = await supabase.auth.getUser()
    userId.value = data?.user?.id || null
  } catch {
    userId.value = null
  }
}

async function loadFavorites() {
  favSet.value = new Set()
  if (!userId.value || !supabase) return
  const { data, error } = await supabase
    .from('favorites')
    .select('poem_id')
    .eq('user_id', userId.value)
    .limit(1000)
  if (!error && data) {
    favSet.value = new Set(data.map(d => d.poem_id))
  }
}

// 最新列表 -----------------------------------------
async function loadLatest(reset = true) {
  if (reset) {
    loading.value = true
    page.value = 1
    hasMore.value = true
    items.value = []
  } else {
    loadingMore.value = true
  }

  if (!supabase) {
    loading.value = false
    loadingMore.value = false
    hasMore.value = false
    return
  }

  const from = (page.value - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error } = await supabase
    .from('v_poem_with_categories')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!error && data) {
    items.value = reset ? data : [...items.value, ...data]
    if (data.length < pageSize) hasMore.value = false
  } else {
    hasMore.value = false
  }

  loading.value = false
  loadingMore.value = false
}

async function loadMore() {
  if (!hasMore.value) return
  page.value += 1
  await loadLatest(false)
}

onMounted(async () => {
  await loadUser()
  await Promise.all([
    loadFavorites(),
    loadLatest(true),
    loadFeaturedPoems(),
    loadFeaturedPoets(),
  ])
})
</script>