<script setup>
import ImagenSegura from '@/components/ImagenSegura.vue'
import EstadoBadge from '@/components/EstadoBadge.vue'
import BarraCupo from '@/components/BarraCupo.vue'
import { FORMATOS } from '@/utils/torneos'
import { formatearFecha } from '@/utils/formato'
import { nombreZona } from '@/utils/zonas'

// Componente presentacional: solo recibe datos y los muestra
defineProps({ torneo: { type: Object, required: true } })
</script>

<template>
  <RouterLink :to="{ name: 'torneo', params: { id: torneo.id } }" class="card">
    <div class="portada">
      <ImagenSegura :src="torneo.banner_url || torneo.juego?.logo_url" :alt="torneo.nombre" />
      <EstadoBadge :estado="torneo.estado" class="estado" />
    </div>
    <div class="cuerpo">
      <span class="juego">{{ torneo.juego?.nombre }}</span>
      <h3>{{ torneo.nombre }}</h3>
      <ul class="datos">
        <li>📅 {{ formatearFecha(torneo.fecha) }}</li>
        <li>📍 {{ nombreZona(torneo.zona) }}<template v-if="torneo.lugar"> · {{ torneo.lugar }}</template></li>
        <li>🏆 {{ FORMATOS[torneo.formato] }}</li>
      </ul>
      <BarraCupo :torneo="torneo" />
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  overflow: hidden;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 59, 59, 0.5);
  box-shadow: var(--sombra);
}

.portada {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--surface-2);
}

.portada img {
  width: 100%;
  height: 100%;
}

.portada::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(13, 13, 18, 0.85));
}

.estado {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1;
  backdrop-filter: blur(6px);
}

.cuerpo {
  padding: 1rem 1.1rem 1.2rem;
  display: grid;
  gap: 0.6rem;
}

.juego {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--amarillo);
}

h3 {
  margin: 0;
  font-size: 1.65rem;
}

.datos {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.15rem;
  font-size: 0.86rem;
  color: var(--muted);
}
</style>
