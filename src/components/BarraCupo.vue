<script setup>
import { computed } from 'vue'
import { porcentajeOcupacion, cuposDisponibles } from '@/utils/torneos'

const props = defineProps({ torneo: { type: Object, required: true } })

const porcentaje = computed(() => porcentajeOcupacion(props.torneo))
const libres = computed(() => cuposDisponibles(props.torneo))
</script>

<template>
  <div class="cupo">
    <div class="texto">
      <span><b>{{ torneo.inscriptos }}</b> / {{ torneo.cupo }} jugadores</span>
      <span class="muted">{{ libres ? `${libres} libres` : 'Completo' }}</span>
    </div>
    <div class="barra" role="progressbar" :aria-valuenow="porcentaje" aria-valuemin="0" aria-valuemax="100">
      <div class="relleno" :class="{ lleno: porcentaje >= 100 }" :style="{ width: `${porcentaje}%` }" />
    </div>
  </div>
</template>

<style scoped>
.texto {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  margin-bottom: 0.35rem;
}

.barra {
  height: 6px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}

.relleno {
  height: 100%;
  background: linear-gradient(90deg, var(--amarillo), var(--rojo));
  border-radius: inherit;
  transition: width 0.4s ease;
}

.relleno.lleno {
  background: var(--muted);
}
</style>
