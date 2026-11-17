<script setup>
import useUiStore from '@/stores/uiStore'

const ui = useUiStore()
</script>

<template>
  <div class="toasts" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in ui.toasts" :key="t.id" :class="['toast', t.tipo]" @click="ui.cerrar(t.id)">
        {{ t.mensaje }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 100;
  display: grid;
  gap: 0.5rem;
  max-width: min(380px, calc(100% - 2rem));
}

.toast {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  background: var(--surface-2);
  border: 1px solid var(--borde);
  border-left: 4px solid var(--verde);
  box-shadow: var(--sombra);
  font-size: 0.9rem;
  cursor: pointer;
}

.toast.error {
  border-left-color: var(--rojo);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
