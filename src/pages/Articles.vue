<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">赏析文章</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RouterLink to="/articles/1" class="flex group rounded-xl border p-4 bg-white hover:shadow">
          <img src="https://ai-public.mastergo.com/ai/img_res/d9f83aa137d24c4f123f3d37236ee00a.jpg" class="w-40 h-28 object-cover rounded-lg" />
          <div class="ml-4">
            <h3 class="text-xl font-semibold text-gray-800 group-hover:text-blue-600">文章标题</h3>
            <p class="text-gray-500 text-sm mt-1">作者 · 日期</p>
            <p class="text-gray-600 mt-2 line-clamp-2">摘要……</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </main>
</template>