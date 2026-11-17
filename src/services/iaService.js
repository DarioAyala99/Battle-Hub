import api from '@/services/api'

// El navegador NUNCA habla con el LLM: llama a la Edge Function,
// que es la única que conoce la API key de Cohere.
const iaService = {
  async generarAnuncio({ torneoId, tono, extra }) {
    const { data } = await api.post(
      '/functions/v1/ai-anuncio',
      { torneo_id: torneoId, tono, extra },
      { timeout: 30000 } // el LLM puede tardar más que una request normal
    )
    return data.anuncio
  }
}

export default iaService
