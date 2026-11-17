<script setup>
import { ref, watch, computed } from 'vue'

// Muestra una imagen externa (logo / arte oficial cargado por URL).
// Si la URL está vacía o el sitio bloquea el hotlinking, usa una imagen de respaldo.
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  ajuste: { type: String, default: 'cover' } // cover | contain
})

const fallo = ref(false)
watch(() => props.src, () => (fallo.value = false))

const respaldo = `${import.meta.env.BASE_URL}fallback.svg`
const url = computed(() => (!props.src || fallo.value ? respaldo : props.src))
</script>

<template>
  <img
    :src="url"
    :alt="alt"
    :style="{ objectFit: ajuste }"
    loading="lazy"
    referrerpolicy="no-referrer"
    @error="fallo = true"
  />
</template>
