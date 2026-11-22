// Zonas donde se puede realizar un torneo: las provincias argentinas, con dos divisiones
// La lista tiene que coincidir con el CHECK de la columna torneos.zona en supabase/schema.sql.

export const ZONAS = [
  { value: 'caba', label: 'Capital Federal' },
  { value: 'buenos_aires', label: 'Buenos Aires (provincia)' },
  { value: 'catamarca', label: 'Catamarca' },
  { value: 'chaco', label: 'Chaco' },
  { value: 'chubut', label: 'Chubut' },
  { value: 'cordoba', label: 'Córdoba' },
  { value: 'corrientes', label: 'Corrientes' },
  { value: 'entre_rios', label: 'Entre Ríos' },
  { value: 'formosa', label: 'Formosa' },
  { value: 'jujuy', label: 'Jujuy' },
  { value: 'la_pampa', label: 'La Pampa' },
  { value: 'la_rioja', label: 'La Rioja' },
  { value: 'mendoza', label: 'Mendoza' },
  { value: 'misiones', label: 'Misiones' },
  { value: 'neuquen', label: 'Neuquén' },
  { value: 'rio_negro', label: 'Río Negro' },
  { value: 'rosario', label: 'Rosario' },
  { value: 'salta', label: 'Salta' },
  { value: 'san_juan', label: 'San Juan' },
  { value: 'san_luis', label: 'San Luis' },
  { value: 'santa_cruz', label: 'Santa Cruz' },
  { value: 'santa_fe', label: 'Santa Fe' },
  { value: 'santiago_del_estero', label: 'Santiago del Estero' },
  { value: 'tierra_del_fuego', label: 'Tierra del Fuego' },
  { value: 'tucuman', label: 'Tucumán' },
  { value: 'online', label: 'Online' }
]

const ETIQUETAS = Object.fromEntries(ZONAS.map((z) => [z.value, z.label]))

export const esZonaValida = (valor) => valor in ETIQUETAS

// Si llega un valor desconocido, se muestra tal cual en vez de romper.
export const nombreZona = (valor) => ETIQUETAS[valor] ?? valor ?? '-'
