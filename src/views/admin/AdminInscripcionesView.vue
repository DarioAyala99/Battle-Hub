<script setup>
import { reactive, computed, watch } from 'vue'
import { useTorneoDetalle } from '@/composables/useTorneoDetalle'
import useUiStore from '@/stores/uiStore'
import EstadoBadge from '@/components/EstadoBadge.vue'
import EstadoCarga from '@/components/EstadoCarga.vue'
import { ESTADOS } from '@/utils/torneos'
import { formatearFecha } from '@/utils/formato'

const props = defineProps({ id: { type: String, required: true } })

const ui = useUiStore()
const {
  torneo,
  inscripciones,
  loading,
  error,
  procesando,
  cargar,
  actualizarInscripcion,
  eliminarInscripcion,
  cambiarEstado
} = useTorneoDetalle(() => props.id)

// Borradores de edición por fila: { [idInscripcion]: { posicion, main } }
const borradores = reactive({})
watch(
  inscripciones,
  (lista) => {
    lista.forEach((i) => (borradores[i.id] = { posicion: i.posicion ?? '', main: i.main }))
  },
  { immediate: true }
)

const personajes = computed(() => torneo.value?.juego?.personajes ?? [])

const cambio = (i) => {
  const b = borradores[i.id]
  return b && ((b.posicion || null) !== (i.posicion ?? null) || b.main !== i.main)
}

const guardar = async (i) => {
  const b = borradores[i.id]
  const posicion = b.posicion === '' ? null : Number(b.posicion)
  if (posicion !== null && (!Number.isInteger(posicion) || posicion < 1 || posicion > (torneo.value?.cupo ?? 256))) {
    return ui.error('La posición debe ser un entero entre 1 y el cupo del torneo')
  }
  try {
    await actualizarInscripcion(i.id, { posicion, main: b.main })
    ui.exito(`Guardado: ${i.gamertag}`)
  } catch (err) {
    ui.error(err.message)
  }
}

const quitar = async (i) => {
  if (!confirm(`¿Quitar a ${i.gamertag} del torneo?`)) return
  try {
    await eliminarInscripcion(i.id)
    ui.exito('Inscripción eliminada')
  } catch (err) {
    ui.error(err.message)
  }
}

const setEstado = async (estado) => {
  try {
    await cambiarEstado(estado)
    ui.exito(`Estado: ${ESTADOS[estado]}`)
  } catch (err) {
    ui.error(err.message)
  }
}
</script>

<template>
  <EstadoCarga :loading="loading && !torneo" :error="error" @reintentar="cargar">
    <div v-if="torneo">
      <div class="cabecera">
        <div>
          <RouterLink :to="{ name: 'admin-torneos' }" class="muted volver">← Gestionar torneos</RouterLink>
          <span class="etiqueta-seccion">{{ torneo.juego?.nombre }} · {{ formatearFecha(torneo.fecha) }}</span>
          <h1>{{ torneo.nombre }}</h1>
          <p class="muted">{{ inscripciones.length }} / {{ torneo.cupo }} inscriptos · <EstadoBadge :estado="torneo.estado" /></p>
        </div>
      </div>

      <section class="panel estados">
        <span class="muted">Cambiar estado:</span>
        <button
          v-for="(label, valor) in ESTADOS"
          :key="valor"
          :class="['btn', 'btn-chico', { 'btn-primario': torneo.estado === valor }]"
          :disabled="procesando || torneo.estado === valor"
          @click="setEstado(valor)"
        >
          {{ label }}
        </button>
      </section>

      <p class="muted ayuda">
        Al finalizar el torneo cargá la posición final de cada jugador (1 = campeón).
        En eliminación doble puede haber empates (ej. dos jugadores en 5°).
      </p>

      <EstadoCarga :vacio="!inscripciones.length" texto-vacio="Todavía no hay inscriptos.">
        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th>Gamertag</th>
                <th>Main</th>
                <th>Posición</th>
                <th>Inscripto</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in inscripciones" :key="i.id">
                <td><strong>{{ i.gamertag }}</strong></td>
                <td>
                  <select v-model="borradores[i.id].main" class="control mini">
                    <option v-for="p in personajes" :key="p" :value="p">{{ p }}</option>
                    <option v-if="!personajes.includes(i.main)" :value="i.main">{{ i.main }}</option>
                  </select>
                </td>
                <td>
                  <input
                    v-model="borradores[i.id].posicion"
                    type="number"
                    min="1"
                    :max="torneo.cupo"
                    class="control posicion"
                    placeholder="-"
                    :aria-label="`Posición de ${i.gamertag}`"
                  />
                </td>
                <td class="muted chico">{{ formatearFecha(i.creado_en, { dateStyle: 'short' }) }}</td>
                <td>
                  <div class="acciones">
                    <button class="btn btn-chico btn-primario" :disabled="procesando || !cambio(i)" @click="guardar(i)">
                      Guardar
                    </button>
                    <button class="btn btn-chico btn-peligro" :disabled="procesando" @click="quitar(i)">Quitar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </EstadoCarga>
    </div>
  </EstadoCarga>
</template>

<style scoped>
.volver {
  display: block;
  width: fit-content;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.estados {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.ayuda {
  font-size: 0.85rem;
}

.mini {
  min-width: 150px;
  padding: 0.4rem 0.6rem;
}

.posicion {
  width: 80px;
  padding: 0.4rem 0.6rem;
}

.chico {
  font-size: 0.82rem;
}
</style>
