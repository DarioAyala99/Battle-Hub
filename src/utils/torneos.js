import { esZonaValida } from './zonas.js'

// La base de datos vuelve a validar todo (trigger + RLS); esto es para dar feedback inmediato.

export const ESTADOS = {
  abierto: 'Inscripción abierta',
  cerrado: 'Inscripción cerrada',
  en_curso: 'En curso',
  finalizado: 'Finalizado'
}

export const FORMATOS = {
  eliminacion_doble: 'Eliminación doble',
  eliminacion_simple: 'Eliminación simple',
  round_robin: 'Round robin'
}

export const CUPO_MIN = 2
export const CUPO_MAX = 256

export const cuposDisponibles = (torneo) =>
  Math.max((torneo?.cupo ?? 0) - (torneo?.inscriptos ?? 0), 0)

export const porcentajeOcupacion = (torneo) => {
  if (!torneo?.cupo) return 0
  return Math.min(Math.round(((torneo.inscriptos ?? 0) / torneo.cupo) * 100), 100)
}

/**
 * ¿Puede el usuario actual inscribirse? Devuelve { ok, motivo }.
 * El motivo se muestra en la UI cuando no puede.
 */
export const puedeInscribirse = ({ torneo, isAuthenticated, yaInscripto }) => {
  if (!torneo) return { ok: false, motivo: 'Torneo no encontrado' }
  if (torneo.estado !== 'abierto') return { ok: false, motivo: 'Las inscripciones están cerradas' }
  if (cuposDisponibles(torneo) === 0) return { ok: false, motivo: 'No quedan cupos' }
  if (!isAuthenticated) return { ok: false, motivo: 'Iniciá sesión para inscribirte' }
  if (yaInscripto) return { ok: false, motivo: 'Ya estás inscripto' }
  return { ok: true, motivo: null }
}

/**
 * Valida el formulario de torneo. Devuelve un objeto { campo: mensaje }.
 * Vacío = válido.
 */
export const validarTorneo = (datos, { inscriptosActuales = 0 } = {}) => {
  const errores = {}
  const nombre = datos.nombre?.trim() ?? ''

  if (!datos.juego_id) errores.juego_id = 'Elegí un juego'
  if (nombre.length < 3 || nombre.length > 100) errores.nombre = 'Entre 3 y 100 caracteres'
  if (!datos.fecha || Number.isNaN(new Date(datos.fecha).getTime())) errores.fecha = 'Fecha inválida'

  const cupo = Number(datos.cupo)
  if (!Number.isInteger(cupo) || cupo < CUPO_MIN || cupo > CUPO_MAX) {
    errores.cupo = `Número entero entre ${CUPO_MIN} y ${CUPO_MAX}`
  } else if (cupo < inscriptosActuales) {
    errores.cupo = `Ya hay ${inscriptosActuales} inscriptos: el cupo no puede ser menor`
  }

  if (!esZonaValida(datos.zona)) errores.zona = 'Elegí la provincia o zona'
  if (!FORMATOS[datos.formato]) errores.formato = 'Formato inválido'
  if (!ESTADOS[datos.estado]) errores.estado = 'Estado inválido'
  if (datos.banner_url && !esUrlValida(datos.banner_url)) errores.banner_url = 'URL inválida'

  return errores
}

export const esUrlValida = (valor) => {
  try {
    const url = new URL(valor)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Podio: inscripciones con posición 1, 2 y 3 (puede haber empates en doble eliminación)
export const armarPodio = (inscripciones) =>
  [...inscripciones]
    .filter((i) => i.posicion && i.posicion <= 3)
    .sort((a, b) => a.posicion - b.posicion)
