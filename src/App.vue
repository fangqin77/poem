<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center">
            <img src="https://ai-public.mastergo.com/ai/img_res/c20bf0ceedbeaa89a230b6003c5e368c.jpg" alt="Logo" class="h-10">
          </RouterLink>
        </div>
        <div class="hidden md:flex space-x-8">
          <RouterLink to="/" class="text-gray-800 hover:text-blue-600 font-medium">首页</RouterLink>
          <RouterLink to="/categories" class="text-gray-800 hover:text-blue-600 font-medium">诗词分类</RouterLink>
          <RouterLink to="/poets" class="text-gray-800 hover:text-blue-600 font-medium">诗人介绍</RouterLink>
          <RouterLink to="/articles" class="text-gray-800 hover:text-blue-600 font-medium">赏析文章</RouterLink>
          <RouterLink to="/about" class="text-gray-800 hover:text-blue-600 font-medium">关于我们</RouterLink>
        </div>
        <div class="relative">
          <input v-model="q" @keyup.enter="goSearch" type="text" placeholder="搜索诗词、诗人或文章..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
          <i @click="goSearch" class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" aria-label="搜索"></i>
        </div>
      </div>
    </nav>

    <!-- 主体路由内容：留出导航高度 -->
    <div class="pt-20">
      <RouterView />
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white pt-16 pb-8 mt-16">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 class="text-xl font-bold mb-4">诗词赏析网</h3>
            <p class="text-gray-400">致力于传承和弘扬中华诗词文化，为广大诗词爱好者提供优质的赏析内容和交流平台。</p>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">联系我们</h4>
            <ul class="space-y-2 text-gray-400">
              <li class="flex items-center"><i class="fas fa-envelope mr-2"></i> contact@poetry.com</li>
              <li class="flex items-center"><i class="fas fa-phone mr-2"></i> +86 123 4567 8900</li>
              <li class="flex items-center"><i class="fas fa-map-marker-alt mr-2"></i> 北京市朝阳区文化路123号</li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">快速链接</h4>
            <ul class="space-y-2 text-gray-400">
              <li><RouterLink to="/categories" class="hover:text-white transition">诗词分类</RouterLink></li>
              <li><RouterLink to="/poets" class="hover:text-white transition">诗人介绍</RouterLink></li>
              <li><RouterLink to="/articles" class="hover:text-white transition">赏析文章</RouterLink></li>
              <li><RouterLink to="/about" class="hover:text-white transition">关于我们</RouterLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">关注我们</h4>
            <div class="flex space-x-4">
              <a href="#" class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition"><i class="fab fa-weibo"></i></a>
              <a href="#" class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition"><i class="fab fa-weixin"></i></a>
              <a href="#" class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition"><i class="fab fa-twitter"></i></a>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2023 诗词赏析网. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const q = ref('')
const goSearch = () => {
  const keyword = q.value?.trim()
  if (keyword) router.push({ name: 'search', query: { q: keyword } })
}
</script>