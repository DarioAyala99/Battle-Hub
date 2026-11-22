import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { ZONAS, esZonaValida, nombreZona } from '@/utils/zonas'

describe('zonas', () => {
  it('no tiene valores repetidos', () => {
    const valores = ZONAS.map((z) => z.value)
    expect(new Set(valores).size).toBe(valores.length)
  })

  it('separa Buenos Aires y Santa Fe en dos zonas cada una', () => {
    expect(nombreZona('caba')).toBe('Capital Federal')
    expect(nombreZona('buenos_aires')).toBe('Buenos Aires (provincia)')
    expect(nombreZona('santa_fe')).toBe('Santa Fe')
    expect(nombreZona('rosario')).toBe('Rosario')
  })

  it('valida y muestra valores desconocidos sin romper', () => {
    expect(esZonaValida('cordoba')).toBe(true)
    expect(esZonaValida('Córdoba')).toBe(false)
    expect(nombreZona('desconocida')).toBe('desconocida')
    expect(nombreZona(null)).toBe('-')
  })

  // Si alguien agrega una zona en el frontend y se olvida de la base (o al revés),
  it('coincide con el CHECK de la base de datos (schema.sql)', () => {
    const sql = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8')
    const check = sql.match(/torneos_zona_check check \(zona in \(([\s\S]*?)\)\)/)
    expect(check).not.toBeNull()
    const enBase = [...check[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort()
    expect(enBase).toEqual(ZONAS.map((z) => z.value).sort())
  })
})
