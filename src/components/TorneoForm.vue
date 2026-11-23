<script setup>
import { reactive, ref, computed } from 'vue'
import ImagenSegura from '@/components/ImagenSegura.vue'
import { ESTADOS, FORMATOS, CUPO_MIN, CUPO_MAX, validarTorneo } from '@/utils/torneos'
import { isoALocal, localAIso } from '@/utils/formato'
import { ZONAS } from '@/utils/zonas'

const props = defineProps({
  inicial: { type: Object, default: null },
  juegos: { type: Array, default: () => [] },
  guardando: Boolean
})
const emit = defineEmits(['guardar', 'cancelar'])

const form = reactive({
  juego_id: props.inicial?.juego_id ?? '',
  nombre: props.inicial?.nombre ?? '',
  descripcion: props.inicial?.descripcion ?? '',
  fecha: isoALocal(props.inicial?.fecha),
  lugar: props.inicial?.lugar ?? '',
  zona: props.inicial?.zona ?? '',
  cupo: props.inicial?.cupo ?? 16,
  formato: props.inicial?.formato ?? 'eliminacion_doble',
  estado: props.inicial?.estado ?? 'abierto',
  banner_url: props.inicial?.banner_url ?? ''
})

const errores = ref({})
const juegoElegido = computed(() => props.juegos.find((j) => j.id === form.juego_id))

const enviar = () => {
  const payload = {
    juego_id: form.juego_id,
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    fecha: localAIso(form.fecha),
    lugar: form.lugar.trim() || null,
    zona: form.zona,
    cupo: Number(form.cupo),
    formato: form.formato,
    estado: form.estado,
    banner_url: form.banner_url.trim() || null
  }
  errores.value = validarTorneo(payload, { inscriptosActuales: props.inicial?.inscriptos ?? 0 })
  if (Object.keys(errores.value).length) return
  emit('guardar', payload)
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="enviar">
    <div class="form-fila">
      <div :class="['campo', { invalido: errores.juego_id }]">
        <label for="t-juego">Juego *</label>
        <select id="t-juego" v-model="form.juego_id">
          <option value="" disabled>Elegí un juego</option>
          <option v-for="j in juegos" :key="j.id" :value="j.id">{{ j.nombre }}</option>
        </select>
        <span v-if="errores.juego_id" class="error-campo">{{ errores.juego_id }}</span>
      </div>
      <div :class="['campo', { invalido: errores.nombre }]">
        <label for="t-nombre">Nombre del torneo *</label>
        <input id="t-nombre" v-model="form.nombre" maxlength="100" placeholder="Noche de Puños #13" />
        <span v-if="errores.nombre" class="error-campo">{{ errores.nombre }}</span>
      </div>
    </div>

    <div class="campo">
      <label for="t-desc">Descripción</label>
      <textarea id="t-desc" v-model="form.descripcion" rows="3" placeholder="Reglas, premios, horarios..." />
    </div>

    <div class="form-fila">
      <div :class="['campo', { invalido: errores.fecha }]">
        <label for="t-fecha">Fecha y hora *</label>
        <input id="t-fecha" v-model="form.fecha" type="datetime-local" />
        <span v-if="errores.fecha" class="error-campo">{{ errores.fecha }}</span>
      </div>
      <div :class="['campo', { invalido: errores.zona }]">
        <label for="t-zona">Provincia / zona *</label>
        <select id="t-zona" v-model="form.zona">
          <option value="" disabled>Elegí dónde se juega</option>
          <option v-for="z in ZONAS" :key="z.value" :value="z.value">{{ z.label }}</option>
        </select>
        <span v-if="errores.zona" class="error-campo">{{ errores.zona }}</span>
      </div>
      <div class="campo">
        <label for="t-lugar">Lugar</label>
        <input id="t-lugar" v-model="form.lugar" placeholder="Arcade Palermo / Discord" />
      </div>
    </div>

    <div class="form-fila">
      <div :class="['campo', { invalido: errores.cupo }]">
        <label for="t-cupo">Cupo *</label>
        <input id="t-cupo" v-model.number="form.cupo" type="number" :min="CUPO_MIN" :max="CUPO_MAX" />
        <span v-if="errores.cupo" class="error-campo">{{ errores.cupo }}</span>
      </div>
      <div class="campo">
        <label for="t-formato">Formato</label>
        <select id="t-formato" v-model="form.formato">
          <option v-for="(label, valor) in FORMATOS" :key="valor" :value="valor">{{ label }}</option>
        </select>
      </div>
      <div class="campo">
        <label for="t-estado">Estado</label>
        <select id="t-estado" v-model="form.estado">
          <option v-for="(label, valor) in ESTADOS" :key="valor" :value="valor">{{ label }}</option>
        </select>
      </div>
    </div>

    <div :class="['campo', { invalido: errores.banner_url }]">
      <label for="t-banner">URL del banner / key art</label>
      <div class="con-preview">
        <input id="t-banner" v-model="form.banner_url" type="url" placeholder="https://..." />
        <ImagenSegura class="preview" :src="form.banner_url || juegoElegido?.logo_url" alt="Vista previa" />
      </div>
      <span v-if="errores.banner_url" class="error-campo">{{ errores.banner_url }}</span>
      <span v-else class="ayuda">Si lo dejás vacío se usa el logo del juego.</span>
    </div>

    <div class="botones">
      <button type="button" class="btn btn-fantasma" @click="emit('cancelar')">Cancelar</button>
      <button type="submit" class="btn btn-primario" :disabled="guardando">
        {{ guardando ? 'Guardando...' : inicial ? 'Guardar cambios' : 'Crear torneo' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.con-preview {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.preview {
  width: 96px;
  height: 54px;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1px solid var(--borde);
}

.botones {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
</style>
