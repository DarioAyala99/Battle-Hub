import { defineStore } from 'pinia'

// Estado global de la sesión. Lo leen el header, el router, las vistas y api.js,
// por eso vive en Pinia y no se pasa por props.
const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // { id, email }
    perfil: null, // { nombre, gamertag, rol }
    token: null, // access_token (JWT, vence en ~1 h)
    refreshToken: null, // de un solo uso: sirve para pedir un access_token nuevo
    listo: false // true cuando terminó de restaurarse la sesión al iniciar la app
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    rol: (state) => state.perfil?.rol ?? null,
    isAdmin: (state) => state.perfil?.rol === 'admin',
    gamertag: (state) => state.perfil?.gamertag ?? state.user?.email ?? ''
  },

  actions: {
    setSession({ user, accessToken, refreshToken }) {
      this.user = { id: user.id, email: user.email }
      this.token = accessToken
      this.refreshToken = refreshToken
    },
    // Lo usa el interceptor de api.js al renovar la sesión.
    // Supabase rota el refresh token: cada renovación devuelve uno nuevo.
    setTokens(accessToken, refreshToken) {
      this.token = accessToken
      this.refreshToken = refreshToken
    },
    setPerfil(perfil) {
      this.perfil = perfil
        ? { nombre: perfil.nombre, gamertag: perfil.gamertag, rol: perfil.rol }
        : null
    },
    setListo(valor = true) {
      this.listo = valor
    },
    clear() {
      this.user = null
      this.perfil = null
      this.token = null
      this.refreshToken = null
    }
  },

  persist: {
    key: 'fgc-auth', // storage por defecto: localStorage (la sesión sobrevive a cerrar la pestaña)
    pick: ['user', 'perfil', 'token', 'refreshToken'] // "listo" nunca se persiste
  }
})

export default useAuthStore
