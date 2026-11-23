<script setup>
import { useMisInscripciones } from '@/composables/useMisInscripciones'
import useAuthStore from '@/stores/authStore'
import useUiStore from '@/stores/uiStore'
import EstadoCarga from '@/components/EstadoCarga.vue'
import EstadoBadge from '@/components/EstadoBadge.vue'
import ImagenSegura from '@/components/ImagenSegura.vue'
import { formatearFecha, ordinal } from '@/utils/formato'
import { nombreZona } from '@/utils/zonas'

const auth = useAuthStore()
const ui = useUiStore()
const { items, proximas, historial, victorias, loading, error, cargar, cancelar } = useMisInscripciones()

const confirmarCancelacion = async (inscripcion) => {
  if (!confirm(`¿Cancelar tu inscripción a "${inscripcion.torneo.nombre}"?`)) return
  try {
    await cancelar(inscripcion.id)
    ui.exito('Inscripción cancelada')
  } catch (err) {
    ui.error(err.message)
  }
}
</script>

<template>
  <div>
    <div class="cabecera">
      <div>
        <span class="etiqueta-seccion">Perfil de jugador</span>
        <h1>{{ auth.gamertag }}</h1>
        <p class="muted">{{ items.length }} inscripciones · {{ victorias }} torneos ganados</p>
      </div>
    </div>

    <EstadoCarga
      :loading="loading"
      :error="error"
      :vacio="!items.length"
      texto-vacio="Todavía no te inscribiste a ningún torneo."
      @reintentar="cargar"
    >
      <section class="bloque">
        <h2>Próximos</h2>
        <p v-if="!proximas.length" class="muted">No tenés torneos pendientes.</p>
        <ul class="lista">
          <li v-for="i in proximas" :key="i.id" class="fila">
            <ImagenSegura class="mini" :src="i.torneo.juego?.logo_url" :alt="i.torneo.juego?.nombre" ajuste="contain" />
            <div class="info">
              <RouterLink :to="{ name: 'torneo', params: { id: i.torneo.id } }" class="nombre">
                {{ i.torneo.nombre }}
              </RouterLink>
              <span class="muted">
                {{ i.torneo.juego?.nombre }} · {{ nombreZona(i.torneo.zona) }} · {{ formatearFecha(i.torneo.fecha) }} · Main: {{ i.main }}
              </span>
            </div>
            <EstadoBadge :estado="i.torneo.estado" />
            <button
              v-if="i.torneo.estado === 'abierto'"
              class="btn btn-chico btn-peligro"
              @click="confirmarCancelacion(i)"
            >
              Cancelar
            </button>
          </li>
        </ul>
      </section>

      <section class="bloque">
        <h2>Historial</h2>
        <p v-if="!historial.length" class="muted">Acá vas a ver tus resultados cuando terminen los torneos.</p>
        <div v-else class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr><th>Torneo</th><th>Juego</th><th>Fecha</th><th>Main</th><th>Puesto</th></tr>
            </thead>
            <tbody>
              <tr v-for="i in historial" :key="i.id">
                <td>
                  <RouterLink :to="{ name: 'torneo', params: { id: i.torneo.id } }">{{ i.torneo.nombre }}</RouterLink>
                </td>
                <td>{{ i.torneo.juego?.nombre }}</td>
                <td>{{ formatearFecha(i.torneo.fecha, { dateStyle: 'medium' }) }}</td>
                <td>{{ i.main }}</td>
                <td :class="{ campeon: i.posicion === 1 }">{{ i.posicion === 1 ? '🏆 1°' : ordinal(i.posicion) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </EstadoCarga>
  </div>
</template>

<style scoped>
.bloque {
  margin-bottom: 2.5rem;
}

.lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.6rem;
}

.fila {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: var(--surface);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
}

.mini {
  width: 64px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 6px;
  background: var(--bg);
}

.info {
  display: grid;
  flex: 1;
  min-width: 0;
  font-size: 0.85rem;
}

.nombre {
  font-weight: 700;
  font-size: 1rem;
}

.nombre:hover {
  color: var(--rojo);
}

.campeon {
  color: var(--amarillo);
  font-weight: 700;
}

@media (max-width: 640px) {
  .fila {
    flex-wrap: wrap;
  }
}
</style>
