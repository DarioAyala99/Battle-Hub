<script setup>
// Muestra "cargando", el error o un estado vacío. Evita repetir este v-if en cada vista.
defineProps({
  loading: Boolean,
  error: { type: String, default: null },
  vacio: Boolean,
  textoVacio: { type: String, default: 'No hay nada para mostrar todavía.' }
})
defineEmits(['reintentar'])
</script>

<template>
  <div v-if="loading" class="estado">
    <span class="spinner" aria-hidden="true" /> Cargando...
  </div>
  <div v-else-if="error" class="alerta alerta-error estado-error">
    <span>{{ error }}</span>
    <button class="btn btn-chico" @click="$emit('reintentar')">Reintentar</button>
  </div>
  <div v-else-if="vacio" class="estado muted">{{ textoVacio }}</div>
  <slot v-else />
</template>

<style scoped>
.estado {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 3rem 1rem;
  color: var(--muted);
  border: 1px dashed var(--borde);
  border-radius: var(--radio);
}

.estado-error {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--borde);
  border-top-color: var(--rojo);
  animation: girar 0.7s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
