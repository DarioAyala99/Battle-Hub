import { ref, computed, onMounted } from 'vue'
import inscripcionesService from '@/services/inscripcionesService'
import { extraerMsg } from '@/services/api'
import useAuthStore from '@/stores/authStore'

export const useMisInscripciones = () => {
  const auth = useAuthStore()
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const cargar = async () => {
    loading.value = true
    error.value = null
    try {
      items.value = await inscripcionesService.listarDeJugador(auth.user.id)
    } catch (err) {
      error.value = extraerMsg(err)
    } finally {
      loading.value = false
    }
  }

  const proximas = computed(() => items.value.filter((i) => i.torneo?.estado !== 'finalizado'))
  const historial = computed(() => items.value.filter((i) => i.torneo?.estado === 'finalizado'))
  const victorias = computed(() => historial.value.filter((i) => i.posicion === 1).length)

  const cancelar = async (id) => {
    try {
      await inscripcionesService.eliminar(id)
      items.value = items.value.filter((i) => i.id !== id)
    } catch (err) {
      throw new Error(extraerMsg(err))
    }
  }

  onMounted(cargar)

  return { items, proximas, historial, victorias, loading, error, cargar, cancelar }
}
