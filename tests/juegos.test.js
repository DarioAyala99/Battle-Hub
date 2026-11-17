import { describe, it, expect } from 'vitest'
import { parsePersonajes, personajesATexto, validarJuego } from '@/utils/juegos'

describe('parsePersonajes', () => {
  it('separa por coma y salto de línea, limpiando espacios', () => {
    expect(parsePersonajes(' Ryu ,Ken\n  Chun-Li  \n')).toEqual(['Ryu', 'Ken', 'Chun-Li'])
  })

  it('elimina vacíos y duplicados sin importar mayúsculas', () => {
    expect(parsePersonajes('Ryu,,ryu, RYU , Ken')).toEqual(['Ryu', 'Ken'])
  })

  it('colapsa espacios internos', () => {
    expect(parsePersonajes('Sol   Badguy')).toEqual(['Sol Badguy'])
  })

  it('es reversible con personajesATexto', () => {
    const lista = ['Jin', 'Kazuya']
    expect(parsePersonajes(personajesATexto(lista))).toEqual(lista)
  })
})

describe('validarJuego', () => {
  const existentes = [{ id: '1', nombre: 'Tekken 8' }]
  const valido = { nombre: 'Street Fighter 6', logo_url: null, personajes: ['Ryu'] }

  it('acepta un juego válido', () => {
    expect(validarJuego(valido, existentes)).toEqual({})
  })

  it('rechaza nombres duplicados (sin importar mayúsculas)', () => {
    expect(validarJuego({ ...valido, nombre: 'tekken 8' }, existentes).nombre).toMatch(/Ya existe/)
  })

  it('permite conservar el propio nombre al editar', () => {
    expect(validarJuego({ ...valido, nombre: 'Tekken 8' }, existentes, '1')).toEqual({})
  })

  it('exige al menos un personaje y una URL válida', () => {
    const errores = validarJuego({ ...valido, personajes: [], logo_url: 'ftp://x' }, existentes)
    expect(Object.keys(errores).sort()).toEqual(['logo_url', 'personajes'])
  })
})
