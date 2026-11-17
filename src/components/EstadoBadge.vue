<script setup>
import { ESTADOS } from '@/utils/torneos'

defineProps({ estado: { type: String, required: true } })
</script>

<template>
  <span :class="['badge', estado]">{{ ESTADOS[estado] ?? estado }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid;
}

.badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.abierto {
  color: var(--verde);
  border-color: rgba(61, 220, 132, 0.4);
  background: rgba(61, 220, 132, 0.08);
}
.cerrado {
  color: var(--amarillo);
  border-color: rgba(255, 210, 63, 0.4);
  background: rgba(255, 210, 63, 0.08);
}
.en_curso {
  color: var(--rojo);
  border-color: rgba(255, 59, 59, 0.45);
  background: rgba(255, 59, 59, 0.1);
}
.finalizado {
  color: var(--muted);
  border-color: var(--borde);
  background: var(--surface-2);
}
</style>
