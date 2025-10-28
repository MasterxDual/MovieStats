import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/IndexView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  // Ruta de detalle opcional (placeholder)
  {
    path: '/movie/:id',
    name: 'MovieDetails',
    component: () => import('../views/RegisterView.vue') // cambiar por MovieDetails cuando exista
  },
  // Redirigir cualquier ruta desconocida a la página principal
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
