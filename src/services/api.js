import axios from 'axios'
import config from '@/config'
import useAuthStore from '@/stores/authStore'

// Cliente HTTP único para hablar con Supabase (REST, Auth y Edge Functions)
const api = axios.create({
  baseURL: config.supabaseUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    apikey: config.supabaseAnonKey
  }
})

// Cada request lleva el JWT del usuario si hay sesión; si no, la anon key.
// Postgres usa ese token para aplicar las RLS.
api.interceptors.request.use((requestConfig) => {
  const auth = useAuthStore()
  requestConfig.headers.Authorization = `Bearer ${auth.token ?? config.supabaseAnonKey}`
  return requestConfig
})

// Cliente aparte, SIN interceptores, para renovar el token.
// Si el refresh pasara por `api`, un 401 del propio refresh dispararía otro refresh (loop).
export const authClient = axios.create({
  baseURL: config.supabaseUrl,
  timeout: config.timeout,
  headers: { 'Content-Type': 'application/json', apikey: config.supabaseAnonKey }
})

// Promesa compartida: si varias requests reciben 401 a la vez, todas esperan
// la MISMA renovación (el refresh token es de un solo uso).
let refreshing = null

export const refreshSession = async () => {
  const auth = useAuthStore()
  const { data } = await authClient.post('/auth/v1/token?grant_type=refresh_token', {
    refresh_token: auth.refreshToken
  })
  auth.setTokens(data.access_token, data.refresh_token)
}

// Ante un 401 renueva la sesión y reintenta la request UNA sola vez
api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const auth = useAuthStore()
    const original = err.config
    const esAuth = original?.url?.includes('/auth/v1/')

    if (err.response?.status !== 401 || !original || original._retry || esAuth || !auth.refreshToken) {
      throw err
    }
    original._retry = true

    try {
      refreshing ??= refreshSession().finally(() => (refreshing = null))
      await refreshing
      return api(original) // el interceptor de request pone el token nuevo
    } catch {
      // Refresh vencido o revocado: la sesión terminó.
      // El guard del router manda a login en la próxima navegación.
      auth.clear()
      throw err
    }
  }
)

// Mensajes de error de Supabase traducidos para el usuario
const MENSAJES_AUTH = {
  invalid_credentials: 'Email o contraseña incorrectos',
  user_already_exists: 'Ese email ya está registrado',
  weak_password: 'La contraseña es muy débil (mínimo 6 caracteres)',
  email_not_confirmed: 'Confirmá tu email antes de ingresar',
  over_email_send_rate_limit: 'Demasiados intentos. Esperá unos minutos'
}

const MENSAJES_POSTGRES = {
  42501: 'No tenés permisos para realizar esta acción',
  23505: 'Ya existe un registro con esos datos',
  23503: 'No se puede borrar: hay otros registros que dependen de este',
  23514: 'Algún dato no cumple las reglas (revisá los valores)'
}

export const extraerMsg = (err) => {
  const data = err?.response?.data
  if (data && typeof data === 'object') {
    if (MENSAJES_AUTH[data.error_code]) return MENSAJES_AUTH[data.error_code]
    // P0001 = "raise exception" de nuestros triggers: el mensaje ya está en español
    if (data.code === 'P0001' && data.message) return data.message
    if (MENSAJES_POSTGRES[data.code]) return MENSAJES_POSTGRES[data.code]
    if (data.error) return data.error // Edge Functions
    if (data.msg) return data.msg
    if (data.error_description) return data.error_description
    if (data.message) return data.message
  }
  if (err?.code === 'ECONNABORTED') return 'La solicitud tardó demasiado'
  if (err?.response?.status === 403) return 'No tenés permisos para esta acción'
  if (err?.message === 'Network Error') return 'Sin conexión con el servidor'
  return err?.message ?? 'Error inesperado'
}

export default api
