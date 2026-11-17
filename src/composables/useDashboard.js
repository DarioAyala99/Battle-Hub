import { ref, computed, onMounted } from 'vue'
import torneosService from '@/services/torneosService'
import inscripcionesService from '@/services/inscripcionesService'
import { extraerMsg } from '@/services/api'
import {
  resumen,
  inscriptosPorJuego,
  topMains,
  campeones,
  torneosPorMes
} from '@/utils/estadisticas'

// Trae los datos crudos una vez y deriva todas las métricas con computed
export const useDashboard = () => {
  const torneos = ref([])
  const inscripciones = ref([])
  const loading = ref(false)
  const error = ref(null)

  const cargar = async () => {
    loading.value = true
    error.value = null
    try {
      const [t, i] = await Promise.all([torneosService.listar(), inscripcionesService.listarTodas()])
      torneos.value = t
      inscripciones.value = i
    } catch (err) {
      error.value = extraerMsg(err)
    } finally {
      loading.value = false
    }
  }

  const kpis = computed(() => resumen(torneos.value, inscripciones.value))
  const porJuego = computed(() => inscriptosPorJuego(torneos.value, inscripciones.value))
  const mains = computed(() => topMains(inscripciones.value))
  const ranking = computed(() => campeones(inscripciones.value))
  const porMes = computed(() => torneosPorMes(torneos.value))

  onMounted(cargar)

  return { kpis, porJuego, mains, ranking, porMes, loading, error, cargar }
}
