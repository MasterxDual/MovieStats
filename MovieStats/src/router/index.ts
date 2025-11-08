import { createRouter, createWebHistory } from 'vue-router';
// import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

const routes = [
  // Route '/' will be the catalog view in the future
  // { path: '/', component: LoginView, meta: { requiresAuth: true } },
  // { path: '/products', component: ProductsView, meta: { requiresAuth: true } },
  // { path: '/products/:id', component: ProductDetailView, meta: { requiresAuth: true } },
  // { path: '/clients', component: ClientsView, meta: { requiresAuth: true } },
  // { path: '/cart', component: CartView, meta: { requiresAuth: true } },
  { path: '/', redirect: '/register' },
  { path: '/login', component: LoginView },
  { path:'/register', name: 'Register', component: RegisterView }
];

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
  routes,
  scrollBehavior() { return { top: 0 }; },
});

export default router;