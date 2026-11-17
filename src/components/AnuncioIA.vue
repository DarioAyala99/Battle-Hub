<script setup>
import { ref } from 'vue'
import { useAnuncioIA, TONOS } from '@/composables/useAnuncioIA'
import useUiStore from '@/stores/uiStore'
import config from '@/config'

const props = defineProps({ torneoId: { type: String, required: true } })
const emit = defineEmits(['usar-descripcion'])

const ui = useUiStore()
const { anuncio, loading, error, generar, textoCompleto } = useAnuncioIA()

const tono = ref('epico')
const extra = ref('')

const copiar = async () => {
  try {
    await navigator.clipboard.writeText(textoCompleto())
    ui.exito('Anuncio copiado al portapapeles')
  } catch {
    ui.error('No se pudo copiar. Seleccioná el texto a mano.')
  }
}
</script>

<template>
  <div class="ia">
    <p class="muted intro">
      La IA redacta un anuncio para redes o Discord con los datos reales del torneo
      (juego, fecha, lugar, formato y cupos). No modifica nada hasta que vos lo decidas.
    </p>

    <form class="form" @submit.prevent="generar({ torneoId: props.torneoId, tono, extra })">
      <div class="form-fila">
        <div class="campo">
          <label for="ia-tono">Tono</label>
          <select id="ia-tono" v-model="tono">
            <option v-for="t in TONOS" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
      </div>
      <div class="campo">
        <label for="ia-extra">Indicaciones extra (opcional)</label>
        <textarea
          id="ia-extra"
          v-model="extra"
          rows="2"
          :maxlength="config.maxExtraIA"
          placeholder="Ej: mencioná que hay setups para warm-up desde las 18 h"
        />
        <span class="ayuda">{{ extra.length }} / {{ config.maxExtraIA }}</span>
      </div>
      <button type="submit" class="btn btn-primario" :disabled="loading">
        {{ loading ? 'Generando...' : anuncio ? '↻ Generar otra versión' : '✨ Generar anuncio' }}
      </button>
    </form>

    <div v-if="error" class="alerta alerta-error">{{ error }}</div>

    <article v-if="anuncio" class="resultado">
      <h3>{{ anuncio.titulo }}</h3>
      <p class="texto">{{ anuncio.texto }}</p>
      <p class="hashtags">{{ anuncio.hashtags.join(' ') }}</p>
      <div class="botones">
        <button class="btn btn-chico" @click="copiar">Copiar</button>
        <button class="btn btn-chico" @click="emit('usar-descripcion', anuncio.texto)">
          Usar como descripción del torneo
        </button>
      </div>
    </article>
  </div>
</template>

<style scoped>
.ia {
  display: grid;
  gap: 1rem;
}

.intro {
  margin: 0;
  font-size: 0.9rem;
}

.resultado {
  border: 1px solid rgba(255, 210, 63, 0.35);
  background: rgba(255, 210, 63, 0.05);
  border-radius: var(--radio);
  padding: 1.1rem 1.25rem;
}

.texto {
  white-space: pre-line;
}

.hashtags {
  color: var(--azul);
  font-weight: 600;
  font-size: 0.9rem;
}

.botones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
