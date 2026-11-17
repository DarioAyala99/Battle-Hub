<script setup>
import { computed } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useDashboard } from '@/composables/useDashboard'
import EstadoCarga from '@/components/EstadoCarga.vue'

// Chart.js es modular: se registran solo las piezas que se usan (bundle más chico)
ChartJS.register(BarElement, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)
ChartJS.defaults.color = '#9b9bb0'
ChartJS.defaults.borderColor = '#2c2c3a'
ChartJS.defaults.font.family = 'Inter, system-ui, sans-serif'

const { kpis, porJuego, mains, ranking, porMes, loading, error, cargar } = useDashboard()

const PALETA = ['#ff3b3b', '#ffd23f', '#4da3ff', '#3ddc84', '#b57bff', '#ff8a3d', '#3de0d6', '#ff6fb1']

const opcionesBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
}

const opcionesHorizontal = { ...opcionesBase, indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }
const opcionesDona = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

const datosPorJuego = computed(() => ({
  labels: porJuego.value.map((d) => d.etiqueta),
  datasets: [{ data: porJuego.value.map((d) => d.total), backgroundColor: PALETA, borderWidth: 0 }]
}))

const datosMains = computed(() => ({
  labels: mains.value.map((d) => d.etiqueta),
  datasets: [{ data: mains.value.map((d) => d.total), backgroundColor: '#ff3b3b', borderRadius: 4 }]
}))

const datosPorMes = computed(() => ({
  labels: porMes.value.map((d) => d.etiqueta),
  datasets: [
    {
      data: porMes.value.map((d) => d.total),
      borderColor: '#ffd23f',
      backgroundColor: 'rgba(255, 210, 63, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 4
    }
  ]
}))

const tarjetas = computed(() => [
  { titulo: 'Torneos', valor: kpis.value.torneos, detalle: `${kpis.value.abiertos} con inscripción abierta` },
  { titulo: 'Inscripciones', valor: kpis.value.inscripciones, detalle: 'en todos los torneos' },
  { titulo: 'Jugadores únicos', valor: kpis.value.jugadoresUnicos, detalle: 'que participaron alguna vez' },
  { titulo: 'Ocupación promedio', valor: `${kpis.value.ocupacionPromedio}%`, detalle: 'del cupo de cada torneo' }
])
</script>

<template>
  <div>
    <div class="cabecera">
      <div>
        <span class="etiqueta-seccion">Panel de organizador</span>
        <h1>Dashboard</h1>
        <p class="muted">Estadísticas generadas a partir de los torneos e inscripciones cargados.</p>
      </div>
      <button class="btn btn-chico" :disabled="loading" @click="cargar">↻ Actualizar</button>
    </div>

    <EstadoCarga :loading="loading && !kpis.torneos" :error="error" @reintentar="cargar">
      <section class="kpis">
        <article v-for="t in tarjetas" :key="t.titulo" class="panel kpi">
          <span class="muted titulo">{{ t.titulo }}</span>
          <strong class="valor">{{ t.valor }}</strong>
          <span class="muted detalle">{{ t.detalle }}</span>
        </article>
      </section>

      <section class="graficos">
        <article class="panel">
          <h3>Inscriptos por juego</h3>
          <div class="lienzo">
            <Doughnut v-if="porJuego.length" :data="datosPorJuego" :options="opcionesDona" />
            <p v-else class="muted vacio">Sin inscripciones todavía.</p>
          </div>
        </article>

        <article class="panel">
          <h3>Mains más elegidos</h3>
          <div class="lienzo">
            <Bar v-if="mains.length" :data="datosMains" :options="opcionesHorizontal" />
            <p v-else class="muted vacio">Sin inscripciones todavía.</p>
          </div>
        </article>

        <article class="panel">
          <h3>Torneos por mes</h3>
          <div class="lienzo">
            <Line :data="datosPorMes" :options="opcionesBase" />
          </div>
        </article>

        <article class="panel">
          <h3>Ranking de campeones</h3>
          <ol v-if="ranking.length" class="ranking">
            <li v-for="(r, idx) in ranking" :key="r.etiqueta">
              <span class="puesto">{{ idx + 1 }}</span>
              <strong>{{ r.etiqueta }}</strong>
              <span class="muted">{{ r.total }} {{ r.total === 1 ? 'título' : 'títulos' }}</span>
            </li>
          </ol>
          <p v-else class="muted vacio">Todavía no hay torneos con posiciones cargadas.</p>
        </article>
      </section>
    </EstadoCarga>
  </div>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.kpi {
  display: grid;
  gap: 0.2rem;
  padding: 1.1rem 1.25rem;
}

.titulo {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.valor {
  font-family: var(--display);
  font-weight: 400;
  font-size: 2.6rem;
  line-height: 1;
}

.detalle {
  font-size: 0.8rem;
}

.graficos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(440px, 100%), 1fr));
  gap: 1rem;
}

.lienzo {
  position: relative;
  height: 260px;
}

.vacio {
  display: grid;
  place-items: center;
  height: 100%;
  margin: 0;
}

.ranking {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.ranking li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  background: var(--surface-2);
}

.ranking li:first-child {
  border: 1px solid rgba(255, 210, 63, 0.5);
}

.puesto {
  font-family: var(--display);
  font-size: 1.5rem;
  width: 1.5rem;
  color: var(--amarillo);
}

.ranking .muted {
  margin-left: auto;
  font-size: 0.85rem;
}
</style>
