<script setup>
import { computed, onMounted } from 'vue'
import { useTorneos } from '@/composables/useTorneos'
import useJuegosStore from '@/stores/juegosStore'
import TorneoCard from '@/components/TorneoCard.vue'
import ImagenSegura from '@/components/ImagenSegura.vue'
import EstadoCarga from '@/components/EstadoCarga.vue'

const juegosStore = useJuegosStore()
const { torneos, loading, error, cargar } = useTorneos({ estado: 'abierto' })

const proximos = computed(() => torneos.value.slice(0, 3))

onMounted(() => juegosStore.cargar())
</script>

<template>
  <section class="hero">
    <span class="etiqueta-seccion">Hub de juegos de pelea de Argentina</span>
    <h1>No te pierdas más <span class="acento">torneos</span>.<br />Ahora todos están a un botón de distancia</h1>
    <p class="muted bajada">
      Demostrale a todos estos fraudes quién es el mejor del país.
    </p>
  </section>

  <section v-if="juegosStore.items.length" class="juegos">
    <RouterLink
      v-for="j in juegosStore.items"
      :key="j.id"
      :to="{ name: 'torneos', query: { juego: j.id } }"
      class="juego"
      :title="j.nombre"
    >
      <ImagenSegura v-if="j.logo_url" :src="j.logo_url" :alt="j.nombre" ajuste="contain" />
      <span :class="{ chico: j.logo_url }">{{ j.nombre }}</span>
    </RouterLink>
  </section>

  <section>
    <div class="cabecera">
      <div>
        <span class="etiqueta-seccion">Inscripciones abiertas</span>
        <h2>Próximos torneos</h2>
      </div>
      <RouterLink :to="{ name: 'torneos' }" class="btn btn-chico btn-fantasma">Ver todos →</RouterLink>
    </div>
    <EstadoCarga
      :loading="loading"
      :error="error"
      :vacio="!proximos.length"
      texto-vacio="No hay torneos con inscripción abierta por ahora."
      @reintentar="cargar"
    >
      <div class="grilla">
        <TorneoCard v-for="t in proximos" :key="t.id" :torneo="t" />
      </div>
    </EstadoCarga>
  </section>
</template>

<style scoped>
.hero {
  padding: 3rem 0 2.5rem;
  max-width: 760px;
}

.bajada {
  font-size: 1.08rem;
  max-width: 600px;
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.juegos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 3rem;
}

.juego {
  min-height: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.75rem;
  border-radius: var(--radio);
  background: var(--surface);
  border: 1px solid var(--borde);
  font-family: var(--display);
  font-size: 1.25rem;
  letter-spacing: 0.04em;
  text-align: center;
  transition: border-color 0.15s, transform 0.15s;
}

.juego:hover {
  border-color: var(--rojo);
  transform: translateY(-2px);
}

.juego img {
  width: 100%;
  height: 56px;
}

.juego .chico {
  font-family: var(--sans);
  font-size: 0.75rem;
  color: var(--muted);
  letter-spacing: 0;
}
</style>
