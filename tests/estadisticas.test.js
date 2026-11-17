import { describe, it, expect } from 'vitest'
import {
  resumen,
  ocupacionPromedio,
  inscriptosPorJuego,
  topMains,
  campeones,
  torneosPorMes
} from '@/utils/estadisticas'

const torneos = [
  { id: 't1', estado: 'abierto', cupo: 16, inscriptos: 8, fecha: '2026-11-20T21:00:00Z', juego: { nombre: 'SF6' } },
  { id: 't2', estado: 'finalizado', cupo: 8, inscriptos: 8, fecha: '2026-10-05T21:00:00Z', juego: { nombre: 'Tekken 8' } },
  { id: 't3', estado: 'abierto', cupo: 4, inscriptos: 0, fecha: '2026-11-02T21:00:00Z', juego: { nombre: 'SF6' } }
]

const inscripciones = [
  { torneo_id: 't1', jugador_id: 'a', gamertag: 'Ana', main: 'Ryu', posicion: null },
  { torneo_id: 't1', jugador_id: 'b', gamertag: 'Beto', main: 'Ken', posicion: null },
  { torneo_id: 't2', jugador_id: 'a', gamertag: 'Ana', main: 'Jin', posicion: 1 },
  { torneo_id: 't2', jugador_id: 'c', gamertag: 'Caro', main: 'Ryu', posicion: 2 }
]

describe('estadísticas del dashboard', () => {
  it('resumen calcula los KPIs', () => {
    expect(resumen(torneos, inscripciones)).toEqual({
      torneos: 3,
      abiertos: 2,
      inscripciones: 4,
      jugadoresUnicos: 3,
      ocupacionPromedio: 50 // (50% + 100% + 0%) / 3
    })
  })

  it('ocupacionPromedio devuelve 0 sin torneos', () => {
    expect(ocupacionPromedio([])).toBe(0)
  })

  it('agrupa inscriptos por juego, de mayor a menor', () => {
    expect(inscriptosPorJuego(torneos, inscripciones)).toEqual([
      { etiqueta: 'SF6', total: 2 },
      { etiqueta: 'Tekken 8', total: 2 }
    ])
  })

  it('topMains ordena por cantidad y respeta el límite', () => {
    expect(topMains(inscripciones, 2)).toEqual([
      { etiqueta: 'Ryu', total: 2 },
      { etiqueta: 'Jin', total: 1 }
    ])
  })

  it('campeones solo cuenta primeros puestos', () => {
    expect(campeones(inscripciones)).toEqual([{ etiqueta: 'Ana', total: 1 }])
  })

  it('torneosPorMes rellena con ceros los meses sin torneos', () => {
    const hoy = new Date(2026, 10, 16) // 16 nov 2026
    const totales = torneosPorMes(torneos, 3, hoy).map((m) => m.total)
    expect(totales).toEqual([0, 1, 2]) // sep, oct, nov
  })
})
