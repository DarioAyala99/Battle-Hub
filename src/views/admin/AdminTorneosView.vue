<script setup>
import { ref, onMounted } from 'vue'
import { useTorneos } from '@/composables/useTorneos'
import useJuegosStore from '@/stores/juegosStore'
import useUiStore from '@/stores/uiStore'
import { extraerMsg } from '@/services/api'
import torneosService from '@/services/torneosService'
import BaseModal from '@/components/BaseModal.vue'
import TorneoForm from '@/components/TorneoForm.vue'
import AnuncioIA from '@/components/AnuncioIA.vue'
import EstadoBadge from '@/components/EstadoBadge.vue'
import EstadoCarga from '@/components/EstadoCarga.vue'
import { formatearFecha } from '@/utils/formato'

const juegos = useJuegosStore()
const ui = useUiStore()
const { torneos, loading, error, cargar, crear, actualizar, eliminar } = useTorneos()

const modalForm = ref(false)
const editando = ref(null)
const guardando = ref(false)

const modalIA = ref(false)
const torneoIA = ref(null)

const abrirAlta = () => {
  if (!juegos.items.length) return ui.error('Primero cargá al menos un juego')
  editando.value = null
  modalForm.value = true
}

const abrirEdicion = (torneo) => {
  editando.value = torneo
  modalForm.value = true
}

const guardar = async (payload) => {
  guardando.value = true
  try {
    if (editando.value) {
      await actualizar(editando.value.id, payload)
      ui.exito('Torneo actualizado')
    } else {
      await crear(payload)
      ui.exito('Torneo creado')
    }
    modalForm.value = false
  } catch (err) {
    ui.error(extraerMsg(err))
  } finally {
    guardando.value = false
  }
}

const borrar = async (torneo) => {
  const aviso = torneo.inscriptos ? ` Se borrarán también sus ${torneo.inscriptos} inscripciones.` : ''
  if (!confirm(`¿Eliminar "${torneo.nombre}"?${aviso}`)) return
  try {
    await eliminar(torneo.id)
    ui.exito('Torneo eliminado')
  } catch (err) {
    ui.error(extraerMsg(err))
  }
}

const abrirIA = (torneo) => {
  torneoIA.value = torneo
  modalIA.value = true
}

const usarDescripcion = async (texto) => {
  try {
    await torneosService.actualizar(torneoIA.value.id, { descripcion: texto })
    await cargar()
    ui.exito('Descripción actualizada')
    modalIA.value = false
  } catch (err) {
    ui.error(extraerMsg(err))
  }
}

onMounted(() => juegos.cargar())
</script>

<template>
  <div>
    <div class="cabecera">
      <div>
        <span class="etiqueta-seccion">Panel de organizador</span>
        <h1>Gestionar torneos</h1>
        <p class="muted">Alta, edición y baja de torneos. Desde acá también gestionás inscripciones.</p>
      </div>
      <button class="btn btn-primario" @click="abrirAlta">+ Nuevo torneo</button>
    </div>

    <EstadoCarga
      :loading="loading && !torneos.length"
      :error="error"
      :vacio="!torneos.length"
      texto-vacio="No hay torneos creados."
      @reintentar="cargar"
    >
      <div class="tabla-wrap">
        <table class="tabla">
          <thead>
            <tr>
              <th>Torneo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Inscriptos</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in torneos" :key="t.id">
              <td>
                <RouterLink :to="{ name: 'torneo', params: { id: t.id } }" class="nombre">{{ t.nombre }}</RouterLink>
                <div class="muted chico">{{ t.juego?.nombre }}</div>
              </td>
              <td class="chico">{{ formatearFecha(t.fecha) }}</td>
              <td><EstadoBadge :estado="t.estado" /></td>
              <td>{{ t.inscriptos }} / {{ t.cupo }}</td>
              <td>
                <div class="acciones">
                  <RouterLink :to="{ name: 'admin-inscripciones', params: { id: t.id } }" class="btn btn-chico">
                    Inscripciones
                  </RouterLink>
                  <button class="btn btn-chico" title="Generar anuncio con IA" @click="abrirIA(t)">✨ IA</button>
                  <button class="btn btn-chico" @click="abrirEdicion(t)">Editar</button>
                  <button class="btn btn-chico btn-peligro" @click="borrar(t)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </EstadoCarga>

    <BaseModal
      :abierto="modalForm"
      :titulo="editando ? 'Editar torneo' : 'Nuevo torneo'"
      ancho="720px"
      @cerrar="modalForm = false"
    >
      <TorneoForm
        :key="editando?.id ?? 'nuevo'"
        :inicial="editando"
        :juegos="juegos.items"
        :guardando="guardando"
        @guardar="guardar"
        @cancelar="modalForm = false"
      />
    </BaseModal>

    <BaseModal :abierto="modalIA" :titulo="`Anuncio: ${torneoIA?.nombre ?? ''}`" @cerrar="modalIA = false">
      <AnuncioIA v-if="torneoIA" :key="torneoIA.id" :torneo-id="torneoIA.id" @usar-descripcion="usarDescripcion" />
    </BaseModal>
  </div>
</template>

<style scoped>
.nombre {
  font-weight: 700;
}

.nombre:hover {
  color: var(--rojo);
}

.chico {
  font-size: 0.82rem;
}
</style>
