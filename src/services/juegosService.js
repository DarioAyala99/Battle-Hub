import api from '@/services/api'

const RUTA = '/rest/v1/juegos'
// Prefer: return=representation hace que PostgREST devuelva la fila creada/modificada
const DEVOLVER = { headers: { Prefer: 'return=representation' } }

const juegosService = {
  async listar() {
    const { data } = await api.get(RUTA, { params: { select: '*', order: 'nombre.asc' } })
    return data
  },

  async crear(juego) {
    const { data } = await api.post(RUTA, juego, DEVOLVER)
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

export default juegosService
