<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">诗人列表</h1>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <RouterLink to="/poets/1" class="text-center group">
          <div class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
            <img src="https://ai-public.mastergo.com/ai/img_res/7c36e7c2db897b4f45516737d34b668b.jpg" class="w-full h-full object-cover" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 group-hover:text-blue-600">李白</h3>
          <p class="text-gray-600">唐代</p>
        </RouterLink>
      </div>
    </div>
  </main>
</template>