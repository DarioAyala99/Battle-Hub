<script setup>
import { ref, onMounted } from 'vue'
import useJuegosStore from '@/stores/juegosStore'
import useUiStore from '@/stores/uiStore'
import { extraerMsg } from '@/services/api'
import BaseModal from '@/components/BaseModal.vue'
import JuegoForm from '@/components/JuegoForm.vue'
import ImagenSegura from '@/components/ImagenSegura.vue'
import EstadoCarga from '@/components/EstadoCarga.vue'

const juegos = useJuegosStore()
const ui = useUiStore()

const modalAbierto = ref(false)
const editando = ref(null) // null = alta, objeto = modificación
const guardando = ref(false)

const abrirAlta = () => {
  editando.value = null
  modalAbierto.value = true
}

const abrirEdicion = (juego) => {
  editando.value = juego
  modalAbierto.value = true
}

const guardar = async (payload) => {
  guardando.value = true
  try {
    if (editando.value) {
      await juegos.actualizar(editando.value.id, payload)
      ui.exito('Juego actualizado')
    } else {
      await juegos.crear(payload)
      ui.exito('Juego creado')
    }
    modalAbierto.value = false
  } catch (err) {
    ui.error(extraerMsg(err))
  } finally {
    guardando.value = false
  }
}

const eliminar = async (juego) => {
  if (!confirm(`¿Eliminar "${juego.nombre}"? Solo se puede si no tiene torneos.`)) return
  try {
    await juegos.eliminar(juego.id)
    ui.exito('Juego eliminado')
  } catch (err) {
    ui.error(extraerMsg(err))
  }
}

onMounted(() => juegos.cargar({ forzar: true }))
</script>

<template>
  <div>
    <div class="cabecera">
      <div>
        <span class="etiqueta-seccion">Panel de organizador</span>
        <h1>Juegos</h1>
        <p class="muted">Catálogo de juegos y personajes disponibles para los torneos.</p>
      </div>
      <button class="btn btn-primario" @click="abrirAlta">+ Nuevo juego</button>
    </div>

    <EstadoCarga
      :loading="juegos.loading && !juegos.items.length"
      :error="juegos.error"
      :vacio="!juegos.items.length"
      texto-vacio="No hay juegos cargados."
      @reintentar="juegos.cargar({ forzar: true })"
    >
      <div class="tabla-wrap">
        <table class="tabla">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Juego</th>
              <th>Plataformas</th>
              <th>Personajes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="j in juegos.items" :key="j.id">
              <td><ImagenSegura class="logo" :src="j.logo_url" :alt="j.nombre" ajuste="contain" /></td>
              <td>
                <strong>{{ j.nombre }}</strong>
                <div class="muted chico">{{ j.desarrolladora }}</div>
              </td>
              <td class="muted chico">{{ j.plataformas || '-' }}</td>
              <td>{{ j.personajes.length }}</td>
              <td>
                <div class="acciones">
                  <button class="btn btn-chico" @click="abrirEdicion(j)">Editar</button>
                  <button class="btn btn-chico btn-peligro" @click="eliminar(j)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </EstadoCarga>

    <BaseModal :abierto="modalAbierto" :titulo="editando ? 'Editar juego' : 'Nuevo juego'" @cerrar="modalAbierto = false">
      <!-- :key fuerza a recrear el formulario con los datos del juego elegido -->
      <JuegoForm
        :key="editando?.id ?? 'nuevo'"
        :inicial="editando"
        :existentes="juegos.items"
        :guardando="guardando"
        @guardar="guardar"
        @cancelar="modalAbierto = false"
      />
    </BaseModal>
  </div>
</template>

<style scoped>
.logo {
  width: 84px;
  height: 46px;
  border-radius: 6px;
  background: var(--bg);
}

.chico {
  font-size: 0.82rem;
}
</style>
