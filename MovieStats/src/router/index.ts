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
  // Ruta de detalle de película
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: () => import('../views/MovieDetailView.vue')
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
