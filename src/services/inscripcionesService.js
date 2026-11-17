import api from '@/services/api'

const RUTA = '/rest/v1/inscripciones'
const DEVOLVER = { headers: { Prefer: 'return=representation' } }

const inscripcionesService = {
  async listarPorTorneo(torneoId) {
    const { data } = await api.get(RUTA, {
      params: {
        select: 'id,torneo_id,jugador_id,gamertag,main,posicion,creado_en',
        torneo_id: `eq.${torneoId}`,
        order: 'posicion.asc.nullslast,creado_en.asc'
      }
    })
    return data
  },

  async listarDeJugador(jugadorId) {
    const { data } = await api.get(RUTA, {
      params: {
        select: 'id,main,posicion,creado_en,torneo:torneos(id,nombre,fecha,estado,lugar,juego:juegos(nombre,logo_url))',
        jugador_id: `eq.${jugadorId}`,
        order: 'creado_en.desc'
      }
    })
    return data
  },

  // Para el dashboard: solo las columnas necesarias
  async listarTodas() {
    const { data } = await api.get(RUTA, {
      params: { select: 'torneo_id,jugador_id,gamertag,main,posicion,creado_en' }
    })
    return data
  },

  // jugador_id lo completa la base con auth.uid() (default) y RLS lo valida
  async crear({ torneoId, main }) {
    const { data } = await api.post(RUTA, { torneo_id: torneoId, main }, DEVOLVER)
    return data[0]
  },

  async actualizar(id, cambios) {
    const { data } = await api.patch(RUTA, cambios, { ...DEVOLVER, params: { id: `eq.${id}` } })
    if (!data.length) throw new Error('No se pudo actualizar (¿tenés permisos?)')
    return data[0]
  },

  async eliminar(id) {
    const { data } = await api.delete(RUTA, { ...DEVOLVER, params: { id: `eq.${id}` } })
    // RLS no tira error al bloquear un DELETE: simplemente no borra nada
    if (!data.length) throw new Error('No se pudo cancelar (el torneo ya no está abierto)')
  }
}

export default inscripcionesService
