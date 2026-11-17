import { ref } from 'vue'
import authService from '@/services/authService'
import { extraerMsg } from '@/services/api'

// Envuelve authService con estado de carga y error para los formularios
export const useAuth = () => {
  const loading = ref(false)
  const error = ref(null)

  const ejecutar = async (accion) => {
    loading.value = true
    error.value = null
    try {
      return await accion()
    } catch (err) {
      error.value = extraerMsg(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = (email, password) => ejecutar(() => authService.login(email, password))
  const register = (datos) => ejecutar(() => authService.signup(datos))
  const logout = () => ejecutar(() => authService.logout())

  return { login, register, logout, loading, error }
}
