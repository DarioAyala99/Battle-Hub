<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTorneos } from '@/composables/useTorneos'
import useJuegosStore from '@/stores/juegosStore'
import TorneoCard from '@/components/TorneoCard.vue'
import EstadoCarga from '@/components/EstadoCarga.vue'
import { ESTADOS } from '@/utils/torneos'
import { ZONAS } from '@/utils/zonas'

const route = useRoute()
const router = useRouter()
const juegosStore = useJuegosStore()

// Los filtros viven en la URL (?juego=...&estado=...&zona=...): se pueden compartir y sobreviven al F5
const filtros = computed(() => ({
  juegoId: route.query.juego || undefined,
  estado: route.query.estado || undefined,
  zona: route.query.zona || undefined
}))

const actualizarFiltro = (clave, valor) =>
  router.replace({ query: { ...route.query, [clave]: valor || undefined } })

const { torneos, loading, error, cargar } = useTorneos(filtros)

onMounted(() => juegosStore.cargar())
</script>

<template>
  <div>
    <div class="cabecera">
      <div>
        <span class="etiqueta-seccion">Calendario</span>
        <h1>Torneos</h1>
        <p class="muted">Filtrá por juego, zona o estado y entrá al detalle para inscribirte.</p>
      </div>
    </div>

    <div class="filtros">
      <select
        class="control"
        aria-label="Filtrar por juego"
        :value="route.query.juego ?? ''"
        @change="actualizarFiltro('juego', $event.target.value)"
      >
        <option value="">Todos los juegos</option>
        <option v-for="j in juegosStore.items" :key="j.id" :value="j.id">{{ j.nombre }}</option>
      </select>
      <select
        class="control"
        aria-label="Filtrar por zona"
        :value="route.query.zona ?? ''"
        @change="actualizarFiltro('zona', $event.target.value)"
      >
        <option value="">Todas las zonas</option>
        <option v-for="z in ZONAS" :key="z.value" :value="z.value">{{ z.label }}</option>
      </select>
      <select
        class="control"
        aria-label="Filtrar por estado"
        :value="route.query.estado ?? ''"
        @change="actualizarFiltro('estado', $event.target.value)"
      >
        <option value="">Todos los estados</option>
        <option v-for="(label, valor) in ESTADOS" :key="valor" :value="valor">{{ label }}</option>
      </select>
    </div>

    <EstadoCarga
      :loading="loading"
      :error="error"
      :vacio="!torneos.length"
      texto-vacio="No hay torneos que coincidan con los filtros."
      @reintentar="cargar"
    >
      <div class="grilla">
        <TorneoCard v-for="t in torneos" :key="t.id" :torneo="t" />
      </div>
    </EstadoCarga>
  </div>
</template>
