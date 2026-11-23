import api from '@/services/api'

const RUTA = '/rest/v1/torneos'
const DEVOLVER = { headers: { Prefer: 'return=representation' } }

// Embebe el juego y la CANTIDAD de inscriptos (agregado de PostgREST)
const SELECT = '*,juego:juegos(id,nombre,logo_url,personajes),inscripciones(count)'

// PostgREST devuelve inscripciones: [{ count: N }] -> lo aplanamos a "inscriptos"
const normalizar = (t) => ({
  ...t,
  inscriptos: t.inscripciones?.[0]?.count ?? 0,
  inscripciones: undefined
})

const torneosService = {
  async listar({ juegoId, estado, zona } = {}) {
    const params = { select: SELECT, order: 'fecha.asc' }
    if (juegoId) params.juego_id = `eq.${juegoId}`
    if (estado) params.estado = `eq.${estado}`
    if (zona) params.zona = `eq.${zona}`
    const { data } = await api.get(RUTA, { params })
    return data.map(normalizar)
  },

  async obtener(id) {
    const { data } = await api.get(RUTA, { params: { select: SELECT, id: `eq.${id}` } })
    return data.length ? normalizar(data[0]) : null
  },

  async crear(torneo) {
    const { data } = await api.post(RUTA, torneo, DEVOLVER)
    return data[0]
  },

  async actualizar(id, cambios) {
    const { data } = await api.patch(RUTA, cambios, { ...DEVOLVER, params: { id: `eq.${id}` } })
    if (!data.length) throw new Error('No se pudo actualizar (¿tenés permisos?)')
    return data[0]
  },

  async eliminar(id) {
    await api.delete(RUTA, { params: { id: `eq.${id}` } })
  }
}

export default torneosService
