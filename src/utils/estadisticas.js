// Cálculos del dashboard. Funciones puras: reciben arrays y devuelven datos listos para graficar.

const contar = (items, clave) =>
  items.reduce((acc, item) => {
    const k = typeof clave === 'function' ? clave(item) : item[clave]
    if (k == null || k === '') return acc
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})

const ordenarDesc = (obj) =>
  Object.entries(obj)
    .map(([etiqueta, total]) => ({ etiqueta, total }))
    .sort((a, b) => b.total - a.total || a.etiqueta.localeCompare(b.etiqueta))

export const resumen = (torneos, inscripciones) => ({
  torneos: torneos.length,
  abiertos: torneos.filter((t) => t.estado === 'abierto').length,
  inscripciones: inscripciones.length,
  jugadoresUnicos: new Set(inscripciones.map((i) => i.jugador_id)).size,
  ocupacionPromedio: ocupacionPromedio(torneos)
})

export const ocupacionPromedio = (torneos) => {
  const conCupo = torneos.filter((t) => t.cupo > 0)
  if (!conCupo.length) return 0
  const suma = conCupo.reduce((acc, t) => acc + Math.min((t.inscriptos ?? 0) / t.cupo, 1), 0)
  return Math.round((suma / conCupo.length) * 100)
}

export const inscriptosPorJuego = (torneos, inscripciones) => {
  const juegoDeTorneo = Object.fromEntries(torneos.map((t) => [t.id, t.juego?.nombre ?? 'Sin juego']))
  return ordenarDesc(contar(inscripciones, (i) => juegoDeTorneo[i.torneo_id]))
}

export const topMains = (inscripciones, limite = 8) =>
  ordenarDesc(contar(inscripciones, 'main')).slice(0, limite)

export const campeones = (inscripciones, limite = 5) =>
  ordenarDesc(contar(inscripciones.filter((i) => i.posicion === 1), 'gamertag')).slice(0, limite)

/**
 * Torneos por mes en los últimos `meses` meses (incluye el actual), con ceros donde no hubo.
 * `hoy` es parámetro para que el test sea determinístico.
 */
export const torneosPorMes = (torneos, meses = 6, hoy = new Date()) => {
  const buckets = []
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    buckets.push({
      clave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      etiqueta: d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      total: 0
    })
  }
  const indice = Object.fromEntries(buckets.map((b, i) => [b.clave, i]))
  torneos.forEach((t) => {
    const f = new Date(t.fecha)
    const clave = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`
    if (clave in indice) buckets[indice[clave]].total++
  })
  return buckets.map(({ etiqueta, total }) => ({ etiqueta, total }))
}
