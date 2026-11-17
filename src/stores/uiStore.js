import { defineStore } from 'pinia'

// Notificaciones (toasts) globales: cualquier vista o componente puede disparar
// una sin pasar callbacks por props.
let siguienteId = 1

const useUiStore = defineStore('ui', {
  state: () => ({ toasts: [] }),
  actions: {
    notificar(mensaje, tipo = 'ok', duracion = 3500) {
      const id = siguienteId++
      this.toasts.push({ id, mensaje, tipo })
      setTimeout(() => this.cerrar(id), duracion)
    },
    exito(mensaje) {
      this.notificar(mensaje, 'ok')
    },
    error(mensaje) {
      this.notificar(mensaje, 'error', 5000)
    },
    cerrar(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    }
  }
})

export default useUiStore
