<template>
  <main class="py-16">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <div class="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            {{ poem?.title || ('诗词详情 #' + id) }}
          </h1>
          <p class="text-gray-600">
            <span v-if="poem?.poet_name">{{ poem.poet_name }}</span>
            <span v-if="poem?.dynasty"> · {{ poem.dynasty }}</span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- 登录区 -->
          <div class="flex items-center gap-2">
            <template v-if="!userId">
              <input
                v-model="email"
                type="email"
                placeholder="邮箱登录（魔法链接）"
                class="w-56 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                class="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
                :disabled="authLoading || !validEmail"
                @click="loginWithEmail"
              >
                {{ authLoading ? '发送中…' : '登录' }}
              </button>
            </template>
            <template v-else>
              <span class="text-sm text-gray-600">已登录</span>
              <button
                class="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50"
                :disabled="authLoading"
                @click="logout"
              >
                退出
              </button>
            </template>
          </div>

          <!-- 收藏按钮 -->
          <button
            class="shrink-0 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
                   border transition
                   border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
            :disabled="loading"
            @click="toggleFavorite"
          >
            {{ fav ? '取消收藏' : '收藏' }}
          </button>
        </div>
      </div>

      <article class="prose max-w-none mb-10">
        <p v-if="poem?.content" class="whitespace-pre-line text-gray-800 leading-8">
          {{ poem.content }}
        </p>
        <p v-else class="text-gray-500">正文加载中…</p>
      </article>

      <section class="mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-3">评论</h2>
        <div class="mb-4">
          <textarea
            v-model="newComment"
            rows="3"
            placeholder="写下你的评论…（需要登录）"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div class="mt-2 flex items-center gap-3">
            <button
              class="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
                     bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="posting || !newComment.trim()"
              @click="submitComment"
            >
              {{ posting ? '发表中…' : '发表评论' }}
            </button>
            <span v-if="errMsg" class="text-sm text-red-600">{{ errMsg }}</span>
            <span v-if="okMsg" class="text-sm text-green-600">{{ okMsg }}</span>
          </div>
        </div>

        <ul class="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          <li v-for="c in comments" :key="c.id" class="p-4 flex items-start justify-between gap-3">
            <div>
              <p class="text-gray-800 whitespace-pre-line">{{ c.content }}</p>
              <p class="text-xs text-gray-500 mt-2">{{ formatTime(c.created_at) }}</p>
            </div>
            <button
              v-if="c.user_id === userId"
              class="text-sm text-red-600 hover:text-red-700"
              @click="removeMyComment(c.id)"
              title="删除我的评论"
            >
              删除
            </button>
          </li>
          <li v-if="!comments.length" class="p-6 text-gray-500">还没有评论，来写第一条吧～</li>
        </ul>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPoem } from '@/services/poems'
import { addFavorite, removeFavorite, isFavorited } from '@/services/favorites'
import { listCommentsByPoem, addComment, deleteComment } from '@/services/comments'
import { supabase } from '@/services/supabaseClient'

const route = useRoute()
const id = route.params.id

const poem = ref(null)
const loading = ref(true)
const fav = ref(false)

const comments = ref([])
const totalComments = ref(0)
const newComment = ref('')
const posting = ref(false)
const errMsg = ref('')
const okMsg = ref('')

// auth state
const userId = ref(null)
const email = ref('')
const authLoading = ref(false)
const validEmail = computed(() => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value))

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString()
  } catch (e) {
    return ts
  }
}

async function resolveAuthState() {
  try {
    const { data } = await supabase.auth.getUser()
    userId.value = data?.user?.id || null
  } catch {
    userId.value = null
  }
}

let authUnsub = null
async function watchAuth() {
  if (authUnsub) return
  const { data } = supabase.auth.onAuthStateChange(async () => {
    await resolveAuthState()
    try {
      fav.value = await isFavorited(id)
    } catch {
      fav.value = false
    }
  })
  authUnsub = data.subscription
}

async function loginWithEmail() {
  if (!validEmail.value) return
  authLoading.value = true
  errMsg.value = ''
  okMsg.value = ''
  try {
    await supabase.auth.signInWithOtp({
      email: email.value.trim(),
      options: { emailRedirectTo: window.location.origin }
    })
    okMsg.value = '登录邮件已发送，请查收邮箱完成登录'
  } catch (e) {
    errMsg.value = e?.message || '发送登录邮件失败'
  } finally {
    authLoading.value = false
    if (okMsg.value) setTimeout(() => (okMsg.value = ''), 4000)
    if (errMsg.value) setTimeout(() => (errMsg.value = ''), 3000)
  }
}

async function logout() {
  authLoading.value = true
  try {
    await supabase.auth.signOut()
    userId.value = null
    fav.value = false
  } catch (e) {
    errMsg.value = e?.message || '退出登录失败'
  } finally {
    authLoading.value = false
    if (errMsg.value) setTimeout(() => (errMsg.value = ''), 2500)
  }
}

async function loadData() {
  loading.value = true
  errMsg.value = ''
  okMsg.value = ''
  try {
    poem.value = await getPoem(id)
  } catch {}
  try {
    fav.value = await isFavorited(id)
  } catch {
    fav.value = false
  }
  try {
    const { items, total } = await listCommentsByPoem(id, { page: 1, pageSize: 30 })
    comments.value = items
    totalComments.value = total
  } catch {}
  loading.value = false
}

async function toggleFavorite() {
  try {
    if (fav.value) {
      await removeFavorite(id)
      fav.value = false
    } else {
      await addFavorite(id)
      fav.value = true
    }
  } catch (e) {
    errMsg.value = e?.message || '操作失败，请登录后重试'
    setTimeout(() => (errMsg.value = ''), 2500)
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return
  posting.value = true
  errMsg.value = ''
  okMsg.value = ''
  try {
    await addComment(id, newComment.value.trim())
    newComment.value = ''
    okMsg.value = '已发表'
    await loadData()
  } catch (e) {
    errMsg.value = e?.message || '发表评论失败，请登录后重试'
  } finally {
    posting.value = false
    if (okMsg.value) setTimeout(() => (okMsg.value = ''), 2000)
    if (errMsg.value) setTimeout(() => (errMsg.value = ''), 2500)
  }
}

async function removeMyComment(commentId) {
  try {
    await deleteComment(commentId)
    okMsg.value = '已删除'
    await loadData()
  } catch (e) {
    errMsg.value = e?.message || '删除失败'
  } finally {
    if (okMsg.value) setTimeout(() => (okMsg.value = ''), 2000)
    if (errMsg.value) setTimeout(() => (errMsg.value = ''), 2500)
  }
}

onMounted(async () => {
  await resolveAuthState()
  watchAuth()
  await loadData()
})

onBeforeUnmount(() => {
  try {
    if (authUnsub && typeof authUnsub.unsubscribe === 'function') {
      authUnsub.unsubscribe()
    }
  } catch {}
})
</script>