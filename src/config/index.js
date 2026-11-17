// Fail First, Fail Fast: si falta configuración, la app avisa al arrancar
// en vez de fallar más tarde con un error difícil de rastrear.

const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  timeout: 10000,
  maxExtraIA: 300
}

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.error(
    '[FGC Hub] Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
      'Copiá .env.example como .env y completalo.'
  )
}

export default config
