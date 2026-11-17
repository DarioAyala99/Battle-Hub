import { createApp } from 'vue'
import pinia from '@/stores/piniaState'
import router from '@/router'
import App from './App.vue'
import './style.css'

createApp(App)
  .use(pinia) // Pinia antes que el router: el guard usa el store
  .use(router)
  .mount('#app')
