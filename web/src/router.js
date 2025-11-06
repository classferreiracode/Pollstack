import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Vote from './views/Vote.vue'
import Overlay from './views/Overlay.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/vote/:id', component: Vote, props: true },
  { path: '/overlay/:id', component: Overlay, props: true }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
