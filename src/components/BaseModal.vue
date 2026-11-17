<script setup>
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  abierto: Boolean,
  titulo: { type: String, default: '' },
  ancho: { type: String, default: '640px' }
})
const emit = defineEmits(['cerrar'])

const onKey = (e) => e.key === 'Escape' && emit('cerrar')

// Bloquea el scroll del fondo mientras el modal está abierto
watch(
  () => props.abierto,
  (abierto) => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    abierto ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey)
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="abierto" class="fondo" @mousedown.self="emit('cerrar')">
        <div class="modal" role="dialog" aria-modal="true" :aria-label="titulo" :style="{ maxWidth: ancho }">
          <header>
            <h2>{{ titulo }}</h2>
            <button class="cerrar" aria-label="Cerrar" @click="emit('cerrar')">✕</button>
          </header>
          <div class="contenido">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fondo {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.65);
  display: grid;
  place-items: center;
  padding: 1rem;
  overflow-y: auto;
}

.modal {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--borde);
  border-radius: 14px;
  box-shadow: var(--sombra);
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--borde);
}

header h2 {
  margin: 0;
  font-size: 1.7rem;
}

.cerrar {
  background: none;
  border: 0;
  color: var(--muted);
  font-size: 1.1rem;
  cursor: pointer;
}

.contenido {
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
