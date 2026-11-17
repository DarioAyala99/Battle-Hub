import { createRouter, createWebHashHistory } from 'vue-router'
import useAuthStore from '@/stores/authStore'
import authService from '@/services/authService'

// Hash history (/#/torneos): GitHub Pages no sabe redirigir rutas de una SPA,
// con "history" normal un F5 en /torneos devolvería 404.
const routes = [
  // Públicas
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/torneos', name: 'torneos', component: () => import('@/views/TorneosView.vue') },
  {
    path: '/torneos/:id',
    name: 'torneo',
    component: () => import('@/views/TorneoDetalleView.vue'),
    props: true
  },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { soloInvitados: true } },
  { path: '/registro', name: 'registro', component: () => import('@/views/SignupView.vue'), meta: { soloInvitados: true } },
  { path: '/no-autorizado', name: 'no-autorizado', component: () => import('@/views/NoAutorizadoView.vue') },

  // Jugador logueado
  {
    path: '/mis-inscripciones',
    name: 'mis-inscripciones',
    component: () => import('@/views/MisInscripcionesView.vue'),
    meta: { requiresAuth: true }
  },

  // Solo admin
  {
    path: '/admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: { name: 'admin-dashboard' } },
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'juegos', name: 'admin-juegos', component: () => import('@/views/admin/AdminJuegosView.vue') },
      { path: 'torneos', name: 'admin-torneos', component: () => import('@/views/admin/AdminTorneosView.vue') },
      {
        path: 'torneos/:id/inscripciones',
        name: 'admin-inscripciones',
        component: () => import('@/views/admin/AdminInscripcionesView.vue'),
        props: true
      }
    ]
  },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to) => {
  // 1) Nunca decidir permisos mientras la sesión no se restauró
  await authService.inicializar()
  // El store se pide dentro del guard: Pinia ya está instalado (main.js)
  const auth = useAuthStore()

  // 2) Login / registro no tienen sentido con sesión iniciada
  if (to.meta.soloInvitados && auth.isAuthenticated) return { name: 'torneos' }

  // 3) Rutas que exigen sesión (meta se hereda de las rutas padre)
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 4) Rutas que exigen rol de organizador
  if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'no-autorizado' }
})

export default router
