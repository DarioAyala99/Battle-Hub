import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Instancia única de Pinia con persistencia (para que la sesión sobreviva a un F5)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
