import { describe, it, expect } from 'vitest'
import {
  cuposDisponibles,
  porcentajeOcupacion,
  puedeInscribirse,
  validarTorneo,
  armarPodio,
  esUrlValida
} from '@/utils/torneos'

const torneo = (extra = {}) => ({ estado: 'abierto', cupo: 16, inscriptos: 4, ...extra })

const torneoValido = {
  juego_id: 'abc',
  nombre: 'Noche de Puños',
  fecha: '2026-12-01T21:00:00.000Z',
  cupo: 16,
  formato: 'eliminacion_doble',
  estado: 'abierto',
  banner_url: null
}

describe('cupos', () => {
  it('calcula los cupos libres', () => {
    expect(cuposDisponibles(torneo())).toBe(12)
  })

  it('nunca devuelve cupos negativos', () => {
    expect(cuposDisponibles(torneo({ inscriptos: 20 }))).toBe(0)
  })

  it('calcula el porcentaje de ocupación con tope en 100', () => {
    expect(porcentajeOcupacion(torneo())).toBe(25)
    expect(porcentajeOcupacion(torneo({ inscriptos: 99 }))).toBe(100)
    expect(porcentajeOcupacion({ cupo: 0 })).toBe(0)
  })
})

describe('puedeInscribirse', () => {
  const base = { torneo: torneo(), isAuthenticated: true, yaInscripto: false }

  it('permite inscribirse en un torneo abierto con cupo', () => {
    expect(puedeInscribirse(base)).toEqual({ ok: true, motivo: null })
  })

  it('pide iniciar sesión si no hay usuario', () => {
    expect(puedeInscribirse({ ...base, isAuthenticated: false }).ok).toBe(false)
  })

  it('rechaza si ya está inscripto', () => {
    expect(puedeInscribirse({ ...base, yaInscripto: true }).motivo).toMatch(/inscripto/)
  })

  it('rechaza si el torneo no está abierto', () => {
    for (const estado of ['cerrado', 'en_curso', 'finalizado']) {
      expect(puedeInscribirse({ ...base, torneo: torneo({ estado }) }).ok).toBe(false)
    }
  })

  it('a un visitante le informa primero que el torneo está cerrado', () => {
    const r = puedeInscribirse({ ...base, isAuthenticated: false, torneo: torneo({ estado: 'finalizado' }) })
    expect(r.motivo).toBe('Las inscripciones están cerradas')
  })

  it('rechaza si no quedan cupos', () => {
    const r = puedeInscribirse({ ...base, torneo: torneo({ inscriptos: 16 }) })
    expect(r).toEqual({ ok: false, motivo: 'No quedan cupos' })
  })
})

describe('validarTorneo', () => {
  it('acepta un torneo válido', () => {
    expect(validarTorneo(torneoValido)).toEqual({})
  })

  it('marca los campos obligatorios', () => {
    const errores = validarTorneo({ ...torneoValido, juego_id: '', nombre: 'ab', fecha: null })
    expect(Object.keys(errores).sort()).toEqual(['fecha', 'juego_id', 'nombre'])
  })

  it('valida el rango del cupo', () => {
    expect(validarTorneo({ ...torneoValido, cupo: 1 }).cupo).toBeDefined()
    expect(validarTorneo({ ...torneoValido, cupo: 300 }).cupo).toBeDefined()
    expect(validarTorneo({ ...torneoValido, cupo: 8.5 }).cupo).toBeDefined()
  })

  it('no permite bajar el cupo por debajo de los inscriptos actuales', () => {
    const errores = validarTorneo({ ...torneoValido, cupo: 8 }, { inscriptosActuales: 10 })
    expect(errores.cupo).toMatch(/10 inscriptos/)
  })

  it('valida formato, estado y URL del banner', () => {
    const errores = validarTorneo({ ...torneoValido, formato: 'x', estado: 'y', banner_url: 'no-es-url' })
    expect(Object.keys(errores).sort()).toEqual(['banner_url', 'estado', 'formato'])
  })
})

describe('utilidades', () => {
  it('esUrlValida solo acepta http/https', () => {
    expect(esUrlValida('https://example.com/logo.png')).toBe(true)
    expect(esUrlValida('javascript:alert(1)')).toBe(false)
    expect(esUrlValida('logo.png')).toBe(false)
  })

  it('armarPodio ordena los 3 primeros puestos y respeta empates', () => {
    const podio = armarPodio([
      { id: 1, posicion: 3 },
      { id: 2, posicion: null },
      { id: 3, posicion: 1 },
      { id: 4, posicion: 5 },
      { id: 5, posicion: 2 },
      { id: 6, posicion: 3 }
    ])
    expect(podio.map((i) => i.posicion)).toEqual([1, 2, 3, 3])
  })
})
