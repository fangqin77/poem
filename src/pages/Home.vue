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

    <!-- Featured Poems (静态示例保留) -->
    <section class="py-16 bg-white">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">精选诗词</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <RouterLink to="/poems/1" class="block bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">静夜思</h3>
            <p class="text-gray-600 mb-1">李白 · 唐代</p>
            <p class="text-gray-700 italic mt-4">床前明月光，疑是地上霜。举头望明月，低头思故乡。</p>
          </RouterLink>
          <RouterLink to="/poems/2" class="block bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">水调歌头</h3>
            <p class="text-gray-600 mb-1">苏轼 · 宋代</p>
            <p class="text-gray-700 italic mt-4">明月几时有？把酒问青天。不知天上宫阙，今夕是何年。</p>
          </RouterLink>
          <RouterLink to="/poems/3" class="block bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">春晓</h3>
            <p class="text-gray-600 mb-1">孟浩然 · 唐代</p>
            <p class="text-gray-700 italic mt-4">春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。</p>
          </RouterLink>
          <RouterLink to="/poems/4" class="block bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">念奴娇·赤壁怀古</h3>
            <p class="text-gray-600 mb-1">苏轼 · 宋代</p>
            <p class="text-gray-700 italic mt-4">大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。</p>
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
            <div class="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify中心 mb-4">
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

    <!-- Articles -->
    <section class="py-16 bg-white">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">赏析文章</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <RouterLink to="/articles/1" class="flex group">
            <div class="w-1/3">
              <img src="https://ai-public.mastergo.com/ai/img_res/d9f83aa137d24c4f123f3d37236ee00a.jpg" alt="文章封面" class="w-full h-40 object-cover rounded-lg">
            </div>
            <div class="w-2/3 pl-6">
              <h3 class="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600">《静夜思》中的乡愁意象解析</h3>
              <p class="text-gray-600 text-sm mb-2">作者：文学评论家 王明轩</p>
              <p class="text-gray-500 text-xs mb-3">发布于 2023年5月15日</p>
              <p class="text-gray-700">李白通过明月这一意象，巧妙地表达了游子的思乡之情...</p>
            </div>
          </RouterLink>
          <RouterLink to="/articles/2" class="flex group">
            <div class="w-1/3">
              <img src="https://ai-public.mastergo.com/ai/img_res/fc6d8585554912b70a58a1fd0845ab52.jpg" alt="文章封面" class="w-full h-40 object-cover rounded-lg">
            </div>
            <div class="w-2/3 pl-6">
              <h3 class="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600">苏轼词作中的豁达人生观</h3>
              <p class="text-gray-600 text-sm mb-2">作者：古典文学研究者 李雅婷</p>
              <p class="text-gray-500 text-xs mb-3">发布于 2023年6月2日</p>
              <p class="text-gray-700">苏轼的词作中常表现出对人生的独特见解和豁达态度...</p>
            </div>
          </RouterLink>
        </div>
        <div class="text-center mt-12">
          <RouterLink to="/articles" class="inline-block !rounded-button whitespace-nowrap border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-2 px-6 transition duration-300">
            查看更多文章
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Poets -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">诗人介绍</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <RouterLink to="/poets/1" class="text中心 group">
            <div class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border白色 shadow-lg mb-4">
              <img src="https://ai-public.mastergo.com/ai/img_res/7c36e7c2db897b4f45516737d34b668b.jpg" alt="李白" class="w-full h-full object-cover">
            </div>
            <h3 class="text-xl font-semibold text-gray-800 group-hover:text-blue-600">李白</h3>
            <p class="text-gray-600">唐代浪漫主义诗人</p>
          </RouterLink>
          <RouterLink to="/poets/2" class="text-center group">
            <div class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
              <img src="https://ai-public.mastergo.com/ai/img_res/cc2ffa8624e0ba9efcdb6d9d1dd5427f.jpg" alt="杜甫" class="w-full h-full object-cover">
            </div>
            <h3 class="text-xl font-semibold text-gray-800 group-hover:text-blue-600">杜甫</h3>
            <p class="text-gray-600">唐代现实主义诗人</p>
          </RouterLink>
          <RouterLink to="/poets/3" class="text-center group">
            <div class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
              <img src="https://ai-public.mastergo.com/ai/img_res/b0fde6176342913a4eadfd2be331b708.jpg" alt="苏轼" class="w-full h-full object-cover">
            </div>
            <h3 class="text-xl font-semibold text-gray-800 group-hover:text-blue-600">苏轼</h3>
            <p class="text-gray-600">宋代文学大家</p>
          </RouterLink>
          <RouterLink to="/poets/4" class="text-center group">
            <div class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
              <img src="https://ai-public.mastergo.com/ai/img_res/6f71d9f7335dca1f30713a091c617e7e.jpg" alt="李清照" class="w-full h-full object-cover">
            </div>
            <h3 class="text-xl font-semibold text-gray-800 group-hover:text-blue-600">李清照</h3>
            <p class="text-gray-600">宋代婉约派词人</p>
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
    // 未配置 Supabase 时，不发请求，直接显示空列表
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
  await loadFavorites()
  await loadLatest(true)
})
</script>