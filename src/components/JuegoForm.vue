<script setup>
import { reactive, ref, computed } from 'vue'
import ImagenSegura from '@/components/ImagenSegura.vue'
import { parsePersonajes, personajesATexto, validarJuego } from '@/utils/juegos'

// Formulario presentacional: valida y emite "guardar" con el payload listo.
// La vista padre decide si es alta o modificación y llama al store.
const props = defineProps({
  inicial: { type: Object, default: null },
  existentes: { type: Array, default: () => [] },
  guardando: Boolean
})
const emit = defineEmits(['guardar', 'cancelar'])

const form = reactive({
  nombre: props.inicial?.nombre ?? '',
  desarrolladora: props.inicial?.desarrolladora ?? '',
  plataformas: props.inicial?.plataformas ?? '',
  logo_url: props.inicial?.logo_url ?? '',
  personajesTexto: personajesATexto(props.inicial?.personajes)
})

const errores = ref({})
const personajes = computed(() => parsePersonajes(form.personajesTexto))

const enviar = () => {
  const payload = {
    nombre: form.nombre.trim(),
    desarrolladora: form.desarrolladora.trim() || null,
    plataformas: form.plataformas.trim() || null,
    logo_url: form.logo_url.trim() || null,
    personajes: personajes.value
  }
  errores.value = validarJuego(payload, props.existentes, props.inicial?.id ?? null)
  if (Object.keys(errores.value).length) return
  emit('guardar', payload)
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="enviar">
    <div class="form-fila">
      <div :class="['campo', { invalido: errores.nombre }]">
        <label for="j-nombre">Nombre *</label>
        <input id="j-nombre" v-model="form.nombre" maxlength="80" placeholder="Street Fighter 6" />
        <span v-if="errores.nombre" class="error-campo">{{ errores.nombre }}</span>
      </div>
      <div class="campo">
        <label for="j-dev">Desarrolladora</label>
        <input id="j-dev" v-model="form.desarrolladora" placeholder="Capcom" />
      </div>
    </div>

    <div class="campo">
      <label for="j-plat">Plataformas</label>
      <input id="j-plat" v-model="form.plataformas" placeholder="PC, PS5, Xbox Series" />
    </div>

    <div :class="['campo', { invalido: errores.logo_url }]">
      <label for="j-logo">URL del logo / arte oficial</label>
      <div class="con-preview">
        <input id="j-logo" v-model="form.logo_url" type="url" placeholder="https://..." />
        <ImagenSegura class="preview" :src="form.logo_url" alt="Vista previa" ajuste="contain" />
      </div>
      <span v-if="errores.logo_url" class="error-campo">{{ errores.logo_url }}</span>
      <span v-else class="ayuda">Pegá la URL de una imagen del press kit oficial del juego.</span>
    </div>

    <div :class="['campo', { invalido: errores.personajes }]">
      <label for="j-pers">Personajes * <span class="muted">({{ personajes.length }})</span></label>
      <textarea
        id="j-pers"
        v-model="form.personajesTexto"
        rows="5"
        placeholder="Ryu, Ken, Chun-Li..."
      />
      <span v-if="errores.personajes" class="error-campo">{{ errores.personajes }}</span>
      <span v-else class="ayuda">Separados por coma o salto de línea. Los duplicados se ignoran.</span>
    </div>

    <div class="botones">
      <button type="button" class="btn btn-fantasma" @click="emit('cancelar')">Cancelar</button>
      <button type="submit" class="btn btn-primario" :disabled="guardando">
        {{ guardando ? 'Guardando...' : inicial ? 'Guardar cambios' : 'Crear juego' }}
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
  background: var(--bg);
  border: 1px solid var(--borde);
}

.botones {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
</style>
