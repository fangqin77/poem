<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">诗词分类</h1>
      <p class="text-gray-600 mb-8">根据分类浏览诗词（支持 ?type=tang|song|yuan|gufeng|modern）。</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink to="/poems/1" class="block p-6 rounded-xl border bg-white hover:shadow">
          <h3 class="font-semibold text-gray-800">示例诗词标题</h3>
          <p class="text-sm text-gray-500 mt-1">作者 · 朝代</p>
          <p class="text-gray-600 mt-3 line-clamp-2">首句摘录……</p>
        </RouterLink>
      </div>
    </div>
  </main>
</template>