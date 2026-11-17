import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Se reemplaza el service real: el test no hace requests HTTP
vi.mock('@/services/juegosService', () => ({
  default: {
    listar: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn()
  }
}))

import juegosService from '@/services/juegosService'
import useJuegosStore from '@/stores/juegosStore'

describe('juegosStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('carga los juegos una sola vez salvo que se fuerce', async () => {
    juegosService.listar.mockResolvedValue([{ id: '1', nombre: 'SF6' }])
    const store = useJuegosStore()

    await store.cargar()
    await store.cargar()
    expect(juegosService.listar).toHaveBeenCalledTimes(1)
    expect(store.items).toHaveLength(1)

    await store.cargar({ forzar: true })
    expect(juegosService.listar).toHaveBeenCalledTimes(2)
  })

  it('guarda el mensaje de error si falla la carga', async () => {
    juegosService.listar.mockRejectedValue(new Error('Network Error'))
    const store = useJuegosStore()
    await store.cargar()
    expect(store.error).toBe('Sin conexión con el servidor')
    expect(store.cargado).toBe(false)
  })

  it('crear agrega el juego manteniendo el orden alfabético', async () => {
    const store = useJuegosStore()
    store.items = [{ id: '1', nombre: 'Tekken 8' }]
    juegosService.crear.mockResolvedValue({ id: '2', nombre: 'Guilty Gear' })

    await store.crear({ nombre: 'Guilty Gear' })
    expect(store.items.map((j) => j.nombre)).toEqual(['Guilty Gear', 'Tekken 8'])
  })

  it('actualizar y eliminar modifican la lista local', async () => {
    const store = useJuegosStore()
    store.items = [{ id: '1', nombre: 'SF5' }, { id: '2', nombre: 'Tekken 8' }]
    juegosService.actualizar.mockResolvedValue({ id: '1', nombre: 'SF6' })
    juegosService.eliminar.mockResolvedValue()

    await store.actualizar('1', { nombre: 'SF6' })
    expect(store.porId('1').nombre).toBe('SF6')

    await store.eliminar('2')
    expect(store.items.map((j) => j.id)).toEqual(['1'])
  })
})
