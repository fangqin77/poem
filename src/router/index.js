import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载
const Home = () => import('@/pages/Home.vue')
const Categories = () => import('@/pages/Categories.vue')
const Poets = () => import('@/pages/Poets.vue')
const Articles = () => import('@/pages/Articles.vue')
const About = () => import('@/pages/About.vue')
const Search = () => import('@/pages/Search.vue')
const PoemDetail = () => import('@/pages/PoemDetail.vue')
const PoetDetail = () => import('@/pages/PoetDetail.vue')
const ArticleDetail = () => import('@/pages/ArticleDetail.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/categories', name: 'categories', component: Categories },
    { path: '/poets', name: 'poets', component: Poets },
    { path: '/articles', name: 'articles', component: Articles },
    { path: '/about', name: 'about', component: About },
    { path: '/search', name: 'search', component: Search },
    { path: '/poems/:id', name: 'poem-detail', component: PoemDetail },
    { path: '/poets/:id', name: 'poet-detail', component: PoetDetail },
    { path: '/articles/:id', name: 'article-detail', component: ArticleDetail },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router