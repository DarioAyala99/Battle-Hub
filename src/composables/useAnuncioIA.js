import { ref } from 'vue'
import iaService from '@/services/iaService'
import { extraerMsg } from '@/services/api'

export const TONOS = [
  { value: 'epico', label: 'Épico' },
  { value: 'formal', label: 'Formal' },
  { value: 'divertido', label: 'Divertido' }
]

export const useAnuncioIA = () => {
  const anuncio = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const generar = async ({ torneoId, tono, extra }) => {
    loading.value = true
    error.value = null
    anuncio.value = null
    try {
      anuncio.value = await iaService.generarAnuncio({ torneoId, tono, extra })
    } catch (err) {
      error.value = extraerMsg(err)
    } finally {
      loading.value = false
    }
  }

  // Texto final listo para pegar en Instagram / Discord
  const textoCompleto = () =>
    anuncio.value
      ? `${anuncio.value.titulo}\n\n${anuncio.value.texto}\n\n${anuncio.value.hashtags.join(' ')}`
      : ''

  const limpiar = () => {
    anuncio.value = null
    error.value = null
  }

  return { anuncio, loading, error, generar, textoCompleto, limpiar }
}
