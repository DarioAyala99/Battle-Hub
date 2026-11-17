import api, { authClient, refreshSession } from '@/services/api'
import useAuthStore from '@/stores/authStore'

// El rol se lee SIEMPRE de la tabla profiles (nunca del cliente ni del user_metadata)
async function cargarPerfil() {
  const auth = useAuthStore()
  const { data } = await api.get('/rest/v1/profiles', {
    params: { id: `eq.${auth.user.id}`, select: 'nombre,gamertag,rol' }
  })
  if (!data.length) throw new Error('No se encontró el perfil del usuario')
  auth.setPerfil(data[0])
}

function guardarSesion(data) {
  useAuthStore().setSession({
    user: data.user,
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  })
}

let promesaInicio = null

const authService = {
  async login(email, password) {
    const { data } = await authClient.post('/auth/v1/token?grant_type=password', { email, password })
    guardarSesion(data)
    try {
      await cargarPerfil()
    } catch (err) {
      useAuthStore().clear() // sin perfil no hay rol: no dejamos una sesión a medias
      throw err
    }
  },

  /**
   * Registro. Devuelve { sesionIniciada }:
   * - true  si "Confirm email" está desactivado en Supabase (devuelve la sesión)
   * - false si hay que confirmar el correo antes de ingresar
   */
  async signup({ email, password, nombre, gamertag }) {
    const { data } = await authClient.post('/auth/v1/signup', {
      email,
      password,
      data: { nombre, gamertag } // user_metadata: solo datos cosméticos, nunca el rol
    })
    if (data.access_token) {
      guardarSesion(data)
      await cargarPerfil()
      return { sesionIniciada: true }
    }
    return { sesionIniciada: false }
  },

  async logout() {
    try {
      await api.post('/auth/v1/logout', null, { params: { scope: 'local' } })
    } catch {
      // Si el servidor no responde, igual cerramos la sesión localmente
    } finally {
      useAuthStore().clear()
    }
  },

  /**
   * Restaura la sesión guardada al arrancar la app (se ejecuta una sola vez).
   * El router espera a que termine antes de decidir permisos.
   * Se vuelve a pedir el perfil para que un cambio de rol se refleje sin re-login.
   */
  inicializar() {
    promesaInicio ??= (async () => {
      const auth = useAuthStore()
      try {
        if (auth.token && auth.user) {
          try {
            await cargarPerfil()
          } catch (err) {
            if (err.response?.status !== 401 || !auth.refreshToken) throw err
            await refreshSession()
            await cargarPerfil()
          }
        }
      } catch {
        auth.clear()
      } finally {
        auth.setListo(true)
      }
    })()
    return promesaInicio
  }
}

export default authService
