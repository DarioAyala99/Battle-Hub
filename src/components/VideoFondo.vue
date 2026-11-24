<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, default: '' },
  credito: { type: String, default: '' }
})

// Las rutas de /public dependen del "base" (en GitHub Pages la app vive en /<repo>/)
const base = import.meta.env.BASE_URL
const urlVideo = `${base}${props.src}`
const urlPoster = props.poster ? `${base}${props.poster}` : ''

const video = ref(null)
const pausado = ref(false)

// Accesibilidad y consumo de datos: si el usuario pidió "reducir movimiento" en su sistema
// o activó el ahorro de datos, no se reproduce el video y queda solo la imagen fija.
const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
const ahorroDatos = navigator.connection?.saveData ?? false
const mostrarVideo = !reducirMovimiento && !ahorroDatos

const alternar = () => {
  if (!video.value) return
  if (video.value.paused) {
    video.value.play().catch(() => {})
    pausado.value = false
  } else {
    video.value.pause()
    pausado.value = true
  }
}

// Si la pestaña queda en segundo plano se pausa
const alCambiarVisibilidad = () => {
  if (!video.value || pausado.value) return
  if (document.hidden) video.value.pause()
  else video.value.play().catch(() => {})
}

onMounted(() => {
  // El body tiene un fondo propio que taparía al video: mientras este componente
  // está en pantalla, se vuelve transparente
  document.body.classList.add('con-video')
  document.addEventListener('visibilitychange', alCambiarVisibilidad)
})

onBeforeUnmount(() => {
  document.body.classList.remove('con-video')
  document.removeEventListener('visibilitychange', alCambiarVisibilidad)
})
</script>

<template>
  <div class="fondo" aria-hidden="true">
    <video
      v-if="mostrarVideo"
      ref="video"
      class="media"
      :src="urlVideo"
      :poster="urlPoster"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      disablepictureinpicture
    />
    <img v-else-if="urlPoster" class="media" :src="urlPoster" alt="" />
    <div class="velo" />
  </div>

  <!-- Control de pausa: un contenido en movimiento de más de 5 s tiene que poder detenerse (pauta WCAG 2.2.2) -->
  <div v-if="mostrarVideo || credito" class="controles">
    <button
      v-if="mostrarVideo"
      class="btn btn-chico"
      :aria-label="pausado ? 'Reproducir video de fondo' : 'Pausar video de fondo'"
      @click="alternar"
    >
      {{ pausado ? '▶ Reproducir' : '⏸ Pausar' }}
    </button>
    <span v-if="credito" class="credito">{{ credito }}</span>
  </div>
</template>

<style scoped>
.fondo {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: var(--bg);
}

.media {
  width: 100%;
  height: 100%;
  object-fit: cover; /* cubre toda la pantalla sin deformarse (recorta lo que sobra) */
}

/* Capa oscura encima del video para que el texto se lea bien */
.velo {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(13, 13, 18, 0.85) 0%, rgba(13, 13, 18, 0.45) 60%, rgba(13, 13, 18, 0.6) 100%),
    linear-gradient(180deg, rgba(13, 13, 18, 0.2) 0%, rgba(13, 13, 18, 0.75) 55%, rgba(13, 13, 18, 0.95) 100%);
}

.controles {
  position: fixed;
  left: 1rem; /* a la izquierda: abajo a la derecha aparecen las notificaciones */
  bottom: 1rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.controles .btn {
  background: rgba(23, 23, 31, 0.75);
  backdrop-filter: blur(6px);
}

.credito {
  font-size: 0.72rem;
  color: var(--muted);
  text-shadow: 0 1px 2px #000;
}

@media (max-width: 640px) {
  .credito {
    display: none;
  }
}
</style>
