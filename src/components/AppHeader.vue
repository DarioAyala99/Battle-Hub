<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useAuthStore from '@/stores/authStore'
import useUiStore from '@/stores/uiStore'
import { useAuth } from '@/composables/useAuth'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()
const { logout } = useAuth()

// Ruta relativa al base de Vite: en GitHub Pages la app vive en /<repo>/
const logo = `${import.meta.env.BASE_URL}favicon.svg`

const menuAbierto = ref(false)
watch(() => route.fullPath, () => (menuAbierto.value = false))

const salir = async () => {
  await logout()
  ui.exito('Sesión cerrada')
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="header">
    <div class="contenedor barra">
      <RouterLink :to="{ name: 'home' }" class="logo" aria-label="Battle Hub, inicio">
        <img :src="logo" alt="" width="34" height="34" />
        <span>Battle <b>HUB</b></span>
      </RouterLink>

      <button
        class="hamburguesa"
        :aria-expanded="menuAbierto"
        aria-label="Abrir menú"
        @click="menuAbierto = !menuAbierto"
      >
        <span /><span /><span />
      </button>

      <nav :class="['nav', { abierto: menuAbierto }]">
        <RouterLink :to="{ name: 'torneos' }">Torneos</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" :to="{ name: 'mis-inscripciones' }">
          Mis inscripciones
        </RouterLink>

        <template v-if="auth.isAdmin">
          <span class="separador" aria-hidden="true" />
          <RouterLink :to="{ name: 'admin-dashboard' }">Dashboard</RouterLink>
          <RouterLink :to="{ name: 'admin-torneos' }">Gestionar torneos</RouterLink>
          <RouterLink :to="{ name: 'admin-juegos' }">Juegos</RouterLink>
        </template>

        <div class="sesion">
          <template v-if="auth.isAuthenticated">
            <span class="usuario" :title="auth.user?.email">
              <span class="rol" :class="auth.rol">{{ auth.isAdmin ? 'ORG' : 'P1' }}</span>
              {{ auth.gamertag }}
            </span>
            <button class="btn btn-chico btn-fantasma" @click="salir">Salir</button>
          </template>
          <template v-else>
            <RouterLink :to="{ name: 'login' }" class="btn btn-chico btn-fantasma">Ingresar</RouterLink>
            <RouterLink :to="{ name: 'registro' }" class="btn btn-chico btn-primario">Registrarse</RouterLink>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(13, 13, 18, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--borde);
}

.barra {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--display);
  font-size: 1.7rem;
  letter-spacing: 0.06em;
}

.logo b {
  color: var(--rojo);
  font-weight: 400;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex: 1;
  font-size: 0.92rem;
  font-weight: 500;
}

.nav > a {
  color: var(--muted);
  position: relative;
  padding-block: 0.4rem;
  transition: color 0.15s;
}

.nav > a:hover,
.nav > a.router-link-active {
  color: var(--texto);
}

.nav > a.router-link-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--rojo);
}

.separador {
  width: 1px;
  height: 20px;
  background: var(--borde);
}

.sesion {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.usuario {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 600;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rol {
  font-family: var(--display);
  font-size: 0.95rem;
  padding: 0.05rem 0.4rem;
  border-radius: 4px;
  background: var(--azul);
  color: #06121f;
}

.rol.admin {
  background: var(--amarillo);
  color: #1d1600;
}

.hamburguesa {
  display: none;
  margin-left: auto;
  background: none;
  border: 0;
  padding: 0.5rem;
  cursor: pointer;
  flex-direction: column;
  gap: 5px;
}

.hamburguesa span {
  width: 22px;
  height: 2px;
  background: var(--texto);
  border-radius: 2px;
}

@media (max-width: 900px) {
  .hamburguesa {
    display: flex;
  }

  .nav {
    display: none;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 0.5rem 1rem 1rem;
    background: var(--surface);
    border-bottom: 1px solid var(--borde);
  }

  .nav.abierto {
    display: flex;
  }

  .nav > a {
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--borde);
  }

  .nav > a.router-link-active::after,
  .separador {
    display: none;
  }

  .sesion {
    margin: 1rem 0 0;
    justify-content: space-between;
  }
}
</style>
