<script setup>
import { ref, computed, watch } from 'vue'
import { useTorneoDetalle } from '@/composables/useTorneoDetalle'
import useAuthStore from '@/stores/authStore'
import useUiStore from '@/stores/uiStore'
import ImagenSegura from '@/components/ImagenSegura.vue'
import EstadoBadge from '@/components/EstadoBadge.vue'
import BarraCupo from '@/components/BarraCupo.vue'
import EstadoCarga from '@/components/EstadoCarga.vue'
import { FORMATOS, armarPodio } from '@/utils/torneos'
import { formatearFecha, ordinal } from '@/utils/formato'
import { nombreZona } from '@/utils/zonas'

const props = defineProps({ id: { type: String, required: true } })

const auth = useAuthStore()
const ui = useUiStore()
const {
  torneo,
  inscripciones,
  loading,
  error,
  procesando,
  miInscripcion,
  estadoInscripcion,
  cargar,
  inscribirse,
  cancelar
} = useTorneoDetalle(() => props.id)

const personajes = computed(() => torneo.value?.juego?.personajes ?? [])
const main = ref('')
watch(personajes, (lista) => {
  if (!lista.includes(main.value)) main.value = ''
})

const podio = computed(() => armarPodio(inscripciones.value))
const finalizado = computed(() => torneo.value?.estado === 'finalizado')

const confirmarInscripcion = async () => {
  if (!main.value) return ui.error('Elegí tu personaje principal')
  try {
    await inscribirse(main.value)
    ui.exito(`¡Listo! Estás inscripto con ${main.value}`)
  } catch (err) {
    ui.error(err.message)
  }
}

const confirmarCancelacion = async () => {
  if (!confirm('¿Seguro que querés cancelar tu inscripción?')) return
  try {
    await cancelar()
    ui.exito('Inscripción cancelada')
  } catch (err) {
    ui.error(err.message)
  }
}

const medalla = (pos) => ['🥇', '🥈', '🥉'][pos - 1] ?? ''
</script>

<template>
  <EstadoCarga :loading="loading && !torneo" :error="error" @reintentar="cargar">
    <div v-if="torneo" class="detalle">
      <section class="banner">
        <ImagenSegura :src="torneo.banner_url || torneo.juego?.logo_url" :alt="torneo.nombre" />
        <div class="banner-texto">
          <RouterLink :to="{ name: 'torneos' }" class="volver">← Torneos</RouterLink>
          <span class="etiqueta-seccion">{{ torneo.juego?.nombre }}</span>
          <h1>{{ torneo.nombre }}</h1>
          <EstadoBadge :estado="torneo.estado" />
        </div>
      </section>

      <div class="columnas">
        <div class="principal">
          <section class="panel">
            <h2>Información</h2>
            <dl class="datos">
              <div><dt>Fecha</dt><dd>{{ formatearFecha(torneo.fecha, { dateStyle: 'full', timeStyle: 'short' }) }}</dd></div>
              <div><dt>Provincia / zona</dt><dd>{{ nombreZona(torneo.zona) }}</dd></div>
              <div><dt>Lugar</dt><dd>{{ torneo.lugar || 'A confirmar' }}</dd></div>
              <div><dt>Formato</dt><dd>{{ FORMATOS[torneo.formato] }}</dd></div>
              <div><dt>Cupo</dt><dd>{{ torneo.cupo }} jugadores</dd></div>
            </dl>
            <p v-if="torneo.descripcion" class="descripcion">{{ torneo.descripcion }}</p>
          </section>

          <section v-if="finalizado && podio.length" class="panel">
            <h2>Podio</h2>
            <ol class="podio">
              <li v-for="i in podio" :key="i.id" :class="`pos-${i.posicion}`">
                <span class="medalla">{{ medalla(i.posicion) }}</span>
                <strong>{{ i.gamertag }}</strong>
                <span class="muted">{{ i.main }}</span>
              </li>
            </ol>
          </section>

          <section class="panel">
            <h2>Jugadores inscriptos <span class="muted">({{ inscripciones.length }})</span></h2>
            <p v-if="!inscripciones.length" class="muted">Todavía no hay inscriptos. ¡Sé el primero!</p>
            <div v-else class="tabla-wrap">
              <table class="tabla">
                <thead>
                  <tr>
                    <th v-if="finalizado">Pos.</th>
                    <th>Gamertag</th>
                    <th>Main</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in inscripciones" :key="i.id" :class="{ yo: i.jugador_id === auth.user?.id }">
                    <td v-if="finalizado">{{ ordinal(i.posicion) }}</td>
                    <td>{{ i.gamertag }} <span v-if="i.jugador_id === auth.user?.id" class="vos">VOS</span></td>
                    <td>{{ i.main }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside class="panel lateral">
          <h2>Inscripción</h2>
          <BarraCupo :torneo="torneo" />

          <div v-if="miInscripcion" class="inscripto">
            <div class="alerta alerta-ok">
              Estás inscripto con <strong>{{ miInscripcion.main }}</strong>.
              <template v-if="miInscripcion.posicion">
                Terminaste en el puesto <strong>{{ ordinal(miInscripcion.posicion) }}</strong>.
              </template>
            </div>
            <button
              v-if="torneo.estado === 'abierto'"
              class="btn btn-peligro btn-bloque"
              :disabled="procesando"
              @click="confirmarCancelacion"
            >
              Cancelar inscripción
            </button>
          </div>

          <form v-else-if="estadoInscripcion.ok" class="form" @submit.prevent="confirmarInscripcion">
            <div class="campo">
              <label for="main">Tu main</label>
              <select id="main" v-model="main" required>
                <option value="" disabled>Elegí un personaje</option>
                <option v-for="p in personajes" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primario btn-bloque" :disabled="procesando || !main">
              {{ procesando ? 'Inscribiendo...' : 'Inscribirme' }}
            </button>
          </form>

          <div v-else class="no-puede">
            <p class="muted">{{ estadoInscripcion.motivo }}</p>
            <RouterLink
              v-if="!auth.isAuthenticated && torneo.estado === 'abierto'"
              :to="{ name: 'login', query: { redirect: $route.fullPath } }"
              class="btn btn-primario btn-bloque"
            >
              Iniciar sesión
            </RouterLink>
          </div>

          <RouterLink
            v-if="auth.isAdmin"
            :to="{ name: 'admin-inscripciones', params: { id: torneo.id } }"
            class="btn btn-bloque admin-link"
          >
            ⚙ Gestionar inscripciones
          </RouterLink>
        </aside>
      </div>
    </div>
  </EstadoCarga>
</template>

<style scoped>
.banner {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  min-height: 280px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  border: 1px solid var(--borde);
}

.banner img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(13, 13, 18, 0.1) 0%, rgba(13, 13, 18, 0.92) 85%);
}

.banner-texto {
  position: relative;
  z-index: 1;
  padding: 1.5rem;
}

.volver {
  display: block;
  width: fit-content;
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 1rem;
}

.volver:hover {
  color: var(--texto);
}

.columnas {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  align-items: start;
}

.principal {
  display: grid;
  gap: 1.5rem;
}

.datos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin: 0 0 1rem;
}

.datos dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.datos dd {
  margin: 0.15rem 0 0;
  font-weight: 600;
}

.descripcion {
  white-space: pre-line;
  margin: 0;
  padding-top: 1rem;
  border-top: 1px solid var(--borde);
}

.podio {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.podio li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--surface-2);
}

.podio .pos-1 {
  border: 1px solid rgba(255, 210, 63, 0.5);
  background: rgba(255, 210, 63, 0.07);
}

.medalla {
  font-size: 1.4rem;
}

.lateral {
  position: sticky;
  top: 84px;
  display: grid;
  gap: 1rem;
}

.lateral h2 {
  margin: 0;
}

.inscripto {
  display: grid;
  gap: 0.75rem;
}

.no-puede p {
  margin: 0 0 0.75rem;
}

.tabla tr.yo td {
  background: rgba(77, 163, 255, 0.06);
}

.vos {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  background: var(--azul);
  color: #06121f;
  margin-left: 0.35rem;
}

.admin-link {
  border-style: dashed;
}

@media (max-width: 900px) {
  .columnas {
    grid-template-columns: 1fr;
  }
  .lateral {
    position: static;
    order: -1;
  }
}
</style>
