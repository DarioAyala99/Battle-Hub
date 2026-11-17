import { defineStore } from 'pinia'
import juegosService from '@/services/juegosService'
import { extraerMsg } from '@/services/api'

// Los juegos se usan en muchas pantallas (filtros, formularios, detalle, admin):
// se cargan una sola vez y se comparten desde acá, sin prop drilling.
const useJuegosStore = defineStore('juegos', {
  state: () => ({
    items: [],
    cargado: false,
    loading: false,
    error: null
  }),

  getters: {
    porId: (state) => (id) => state.items.find((j) => j.id === id) ?? null,
    opciones: (state) => state.items.map((j) => ({ value: j.id, label: j.nombre }))
  },

  actions: {
    async cargar({ forzar = false } = {}) {
      if (this.cargado && !forzar) return
      this.loading = true
      this.error = null
      try {
        this.items = await juegosService.listar()
        this.cargado = true
      } catch (err) {
        this.error = extraerMsg(err)
      } finally {
        this.loading = false
      }
    },

    async crear(datos) {
      const nuevo = await juegosService.crear(datos)
      this.items = [...this.items, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre))
      return nuevo
    },

    async actualizar(id, datos) {
      const actualizado = await juegosService.actualizar(id, datos)
      this.items = this.items.map((j) => (j.id === id ? actualizado : j))
      return actualizado
    },

    async eliminar(id) {
      await juegosService.eliminar(id)
      this.items = this.items.filter((j) => j.id !== id)
    }
  }
})

export default useJuegosStore
