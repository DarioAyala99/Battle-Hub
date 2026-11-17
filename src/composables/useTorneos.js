import { ref, watch, toValue } from 'vue'
import torneosService from '@/services/torneosService'
import { extraerMsg } from '@/services/api'

/**
 * Listado de torneos (con filtros opcionales) + operaciones de ABM para el admin.
 * `filtros` puede ser un ref/reactive: al cambiar, se vuelve a cargar.
 */
export const useTorneos = (filtros = {}) => {
  const torneos = ref([])
  const loading = ref(false)
  const error = ref(null)

  const cargar = async () => {
    loading.value = true
    error.value = null
    try {
      torneos.value = await torneosService.listar(toValue(filtros))
    } catch (err) {
      error.value = extraerMsg(err)
    } finally {
      loading.value = false
    }
  }

  // Después de crear/editar se recarga la lista para traer el juego embebido y el conteo
  const crear = async (datos) => {
    await torneosService.crear(datos)
    await cargar()
  }

  const actualizar = async (id, datos) => {
    await torneosService.actualizar(id, datos)
    await cargar()
  }

  const eliminar = async (id) => {
    await torneosService.eliminar(id)
    torneos.value = torneos.value.filter((t) => t.id !== id)
  }

  watch(() => ({ ...toValue(filtros) }), cargar, { deep: true, immediate: true })

  return { torneos, loading, error, cargar, crear, actualizar, eliminar }
}
