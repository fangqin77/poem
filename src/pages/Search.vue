<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">搜索结果</h1>
      <p class="text-gray-600 mb-8">关键字：<span class="font-medium">{{ keyword }}</span></p>
      <div class="text-gray-500">这里展示诗词/诗人/文章的搜索结果（占位）。</div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const keyword = computed(() => route.query.q ?? '')
</script>