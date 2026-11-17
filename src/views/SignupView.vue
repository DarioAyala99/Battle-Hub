<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import useUiStore from '@/stores/uiStore'

const router = useRouter()
const ui = useUiStore()
const { register, loading, error } = useAuth()

const form = reactive({ nombre: '', gamertag: '', email: '', password: '', confirmar: '' })
const errorLocal = ref(null)
const pendienteConfirmacion = ref(false)

const enviar = async () => {
  errorLocal.value = null
  if (form.gamertag.trim().length < 2) return (errorLocal.value = 'El gamertag debe tener al menos 2 caracteres')
  if (form.password.length < 6) return (errorLocal.value = 'La contraseña debe tener al menos 6 caracteres')
  if (form.password !== form.confirmar) return (errorLocal.value = 'Las contraseñas no coinciden')

  try {
    const { sesionIniciada } = await register({
      email: form.email.trim(),
      password: form.password,
      nombre: form.nombre.trim(),
      gamertag: form.gamertag.trim()
    })
    if (sesionIniciada) {
      ui.exito('¡Cuenta creada! Ya podés inscribirte a torneos')
      router.push({ name: 'torneos' })
    } else {
      pendienteConfirmacion.value = true
    }
  } catch {
    // el mensaje ya está en "error"
  }
}
</script>

<template>
  <div class="auth">
    <div class="panel">
      <span class="etiqueta-seccion">New challenger</span>
      <h1>Crear cuenta</h1>

      <div v-if="pendienteConfirmacion" class="alerta alerta-info">
        Te enviamos un email a <strong>{{ form.email }}</strong>. Confirmalo y después
        <RouterLink :to="{ name: 'login' }" class="acento">iniciá sesión</RouterLink>.
      </div>

      <form v-else class="form" @submit.prevent="enviar">
        <div class="form-fila">
          <div class="campo">
            <label for="nombre">Nombre</label>
            <input id="nombre" v-model="form.nombre" autocomplete="name" />
          </div>
          <div class="campo">
            <label for="gamertag">Gamertag *</label>
            <input id="gamertag" v-model="form.gamertag" maxlength="30" required placeholder="Daigo" />
          </div>
        </div>
        <div class="campo">
          <label for="email">Email *</label>
          <input id="email" v-model="form.email" type="email" autocomplete="email" required />
        </div>
        <div class="form-fila">
          <div class="campo">
            <label for="password">Contraseña *</label>
            <input id="password" v-model="form.password" type="password" autocomplete="new-password" required />
          </div>
          <div class="campo">
            <label for="confirmar">Repetir contraseña *</label>
            <input id="confirmar" v-model="form.confirmar" type="password" autocomplete="new-password" required />
          </div>
        </div>
        <div v-if="errorLocal || error" class="alerta alerta-error">{{ errorLocal || error }}</div>
        <button type="submit" class="btn btn-primario btn-bloque" :disabled="loading">
          {{ loading ? 'Creando cuenta...' : 'Registrarme' }}
        </button>
      </form>

      <p class="muted pie">
        ¿Ya tenés cuenta? <RouterLink :to="{ name: 'login' }" class="acento">Ingresá</RouterLink>
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
  width: min(520px, 100%);
}

.pie {
  margin: 1.25rem 0 0;
  text-align: center;
  font-size: 0.9rem;
}
</style>
