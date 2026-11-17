import { esUrlValida } from './torneos.js'

/**
 * Convierte el texto del textarea ("Ryu, Ken\nChun-Li") en un array limpio:
 * sin espacios sobrantes, sin vacíos y sin duplicados (ignorando mayúsculas).
 */
export const parsePersonajes = (texto = '') => {
  const vistos = new Set()
  return texto
    .split(/[,\n]/)
    .map((p) => p.trim().replace(/\s+/g, ' '))
    .filter((p) => {
      const clave = p.toLowerCase()
      if (!p || vistos.has(clave)) return false
      vistos.add(clave)
      return true
    })
}

export const personajesATexto = (personajes = []) => personajes.join(', ')

export const validarJuego = (datos, juegosExistentes = [], idActual = null) => {
  const errores = {}
  const nombre = datos.nombre?.trim() ?? ''

  if (nombre.length < 2 || nombre.length > 80) {
    errores.nombre = 'Entre 2 y 80 caracteres'
  } else if (
    juegosExistentes.some((j) => j.id !== idActual && j.nombre.toLowerCase() === nombre.toLowerCase())
  ) {
    errores.nombre = 'Ya existe un juego con ese nombre'
  }

  if (datos.logo_url && !esUrlValida(datos.logo_url)) errores.logo_url = 'URL inválida'
  if (!datos.personajes?.length) errores.personajes = 'Cargá al menos un personaje'

  return errores
}
