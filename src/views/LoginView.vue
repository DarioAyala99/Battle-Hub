<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import useUiStore from '@/stores/uiStore'
import useAuthStore from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const auth = useAuthStore()
const { login, loading, error } = useAuth()

const form = reactive({ email: '', password: '' })

const enviar = async () => {
  try {
    await login(form.email.trim(), form.password)
    ui.exito(`¡Bienvenido, ${auth.gamertag}!`)
    // Solo se aceptan redirecciones internas (evita open redirect a otro sitio)
    const destino = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : { name: auth.isAdmin ? 'admin-dashboard' : 'torneos' }
    router.push(destino)
  } catch {
    // el mensaje ya está en "error"
  }
}
</script>

<template>
  <div class="auth">
    <div class="panel">
      <span class="etiqueta-seccion">Player select</span>
      <h1>Ingresar</h1>
      <form class="form" @submit.prevent="enviar">
        <div class="campo">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" autocomplete="email" required />
        </div>
        <div class="campo">
          <label for="password">Contraseña</label>
          <input id="password" v-model="form.password" type="password" autocomplete="current-password" required />
        </div>
        <div v-if="error" class="alerta alerta-error">{{ error }}</div>
        <button type="submit" class="btn btn-primario btn-bloque" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
      <p class="muted pie">
        ¿No tenés cuenta? <RouterLink :to="{ name: 'registro' }" class="acento">Registrate</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  place-items: center;
  padding-top: 2rem;
}

.panel {
  width: min(420px, 100%);
}

.pie {
  margin: 1.25rem 0 0;
  text-align: center;
  font-size: 0.9rem;
}
</style>
