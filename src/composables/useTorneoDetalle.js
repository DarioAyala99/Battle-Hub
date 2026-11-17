import { ref, computed, watch, toValue } from 'vue'
import torneosService from '@/services/torneosService'
import inscripcionesService from '@/services/inscripcionesService'
import { extraerMsg } from '@/services/api'
import useAuthStore from '@/stores/authStore'
import { puedeInscribirse } from '@/utils/torneos'

/**
 * Un torneo con sus inscriptos. Lo usan la vista pública de detalle
 * (inscribirse / cancelar) y el panel admin de inscripciones (posiciones).
 */
export const useTorneoDetalle = (torneoId) => {
  const auth = useAuthStore()

  const torneo = ref(null)
  const inscripciones = ref([])
  const loading = ref(false)
  const error = ref(null)
  const procesando = ref(false)

  const cargar = async () => {
    const id = toValue(torneoId)
    if (!id) return
    loading.value = true
    error.value = null
    try {
      const [t, ins] = await Promise.all([
        torneosService.obtener(id),
        inscripcionesService.listarPorTorneo(id)
      ])
      torneo.value = t
      inscripciones.value = ins
      if (!t) error.value = 'El torneo no existe'
    } catch (err) {
      error.value = extraerMsg(err)
    } finally {
      loading.value = false
    }
  }

  const miInscripcion = computed(
    () => inscripciones.value.find((i) => i.jugador_id === auth.user?.id) ?? null
  )

  const estadoInscripcion = computed(() =>
    puedeInscribirse({
      torneo: torneo.value,
      isAuthenticated: auth.isAuthenticated,
      yaInscripto: !!miInscripcion.value
    })
  )

  // Envuelve cada acción: bloquea botones mientras corre y recarga al terminar
  const accion = async (fn) => {
    procesando.value = true
    try {
      await fn()
      await cargar()
    } catch (err) {
      throw new Error(extraerMsg(err))
    } finally {
      procesando.value = false
    }
  }

  const inscribirse = (main) =>
    accion(() => inscripcionesService.crear({ torneoId: toValue(torneoId), main }))

  const cancelar = () => accion(() => inscripcionesService.eliminar(miInscripcion.value.id))

  // --- Admin ---
  const actualizarInscripcion = (id, cambios) =>
    accion(() => inscripcionesService.actualizar(id, cambios))

  const eliminarInscripcion = (id) => accion(() => inscripcionesService.eliminar(id))

  const cambiarEstado = (estado) =>
    accion(() => torneosService.actualizar(toValue(torneoId), { estado }))

  watch(() => toValue(torneoId), cargar, { immediate: true })

  return {
    torneo,
    inscripciones,
    loading,
    error,
    procesando,
    miInscripcion,
    estadoInscripcion,
    cargar,
    inscribirse,
    cancelar,
    actualizarInscripcion,
    eliminarInscripcion,
    cambiarEstado
  }
}
