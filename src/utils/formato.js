export const formatearFecha = (iso, opciones = { dateStyle: 'medium', timeStyle: 'short' }) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('es-AR', opciones)
}

// <input type="datetime-local"> trabaja con "YYYY-MM-DDTHH:mm" en hora LOCAL
export const isoALocal = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ...y la base guarda timestamptz: se convierte a ISO (UTC) antes de enviar
export const localAIso = (local) => (local ? new Date(local).toISOString() : null)

export const ordinal = (n) => (n ? `${n}°` : '-')
