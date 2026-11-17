import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import useAuthStore from '@/stores/authStore'

describe('authStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  const sesion = { user: { id: 'u1', email: 'ana@mail.com' }, accessToken: 'jwt', refreshToken: 'rt' }

  it('arranca sin sesión', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.isAdmin).toBe(false)
    expect(auth.rol).toBeNull()
  })

  it('un jugador logueado no es admin', () => {
    const auth = useAuthStore()
    auth.setSession(sesion)
    auth.setPerfil({ nombre: 'Ana', gamertag: 'AnaFGC', rol: 'jugador' })
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.isAdmin).toBe(false)
    expect(auth.gamertag).toBe('AnaFGC')
  })

  it('reconoce al organizador por el rol del perfil', () => {
    const auth = useAuthStore()
    auth.setSession(sesion)
    auth.setPerfil({ nombre: 'Org', gamertag: 'TO', rol: 'admin' })
    expect(auth.isAdmin).toBe(true)
  })

  it('setPerfil descarta campos extra (solo guarda lo necesario)', () => {
    const auth = useAuthStore()
    auth.setPerfil({ nombre: 'Ana', gamertag: 'A', rol: 'jugador', email: 'x', id: 'y' })
    expect(Object.keys(auth.perfil).sort()).toEqual(['gamertag', 'nombre', 'rol'])
  })

  it('setTokens rota los tokens y clear limpia todo', () => {
    const auth = useAuthStore()
    auth.setSession(sesion)
    auth.setTokens('jwt2', 'rt2')
    expect(auth.token).toBe('jwt2')
    expect(auth.refreshToken).toBe('rt2')

    auth.clear()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.perfil).toBeNull()
  })
})
