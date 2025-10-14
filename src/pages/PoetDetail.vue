<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">诗人详情 #{{ id }}</h1>
      <p class="text-gray-600 mb-6">生平简介与代表作（占位）。</p>
    </div>
  </main>
</template>

<script setup>
import { useRoute } from 'vue-router'
const id = useRoute().params.id
</script>