/// <reference types="node" />
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../store/authStore'

const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  Buffer.from(JSON.stringify({
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '1',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress':   'test@example.com',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role':         'client',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname':      'Анна',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname':        'Петренко',
    exp: Math.floor(Date.now() / 1000) + 86400,
  })).toString('base64')
  .replace(/=/g, '') +
  '.signature'

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null, user: null })
  })

  // ── setToken ─────────────────────────────────────────────

  it('setToken зберігає токен у localStorage', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    expect(localStorage.getItem('token')).toBe(MOCK_TOKEN)
  })

  it('setToken оновлює token у стані', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    expect(useAuthStore.getState().token).toBe(MOCK_TOKEN)
  })

  it('setToken парсить email з JWT', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    expect(useAuthStore.getState().user?.email).toBe('test@example.com')
  })

  it('setToken парсить role з JWT', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    expect(useAuthStore.getState().user?.role).toBe('client')
  })

  it('setToken парсить firstName і lastName з JWT', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    const user = useAuthStore.getState().user
    expect(user?.firstName).toBe('Анна')
    expect(user?.lastName).toBe('Петренко')
  })

  // ── updateUser ───────────────────────────────────────────

  it('updateUser змінює firstName без нового токена', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    useAuthStore.getState().updateUser({ firstName: 'Марія' })
    expect(useAuthStore.getState().user?.firstName).toBe('Марія')
  })

  it('updateUser не затирає незмінені поля', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    useAuthStore.getState().updateUser({ firstName: 'Нове' })
    expect(useAuthStore.getState().user?.email).toBe('test@example.com')
    expect(useAuthStore.getState().user?.role).toBe('client')
  })

  it('updateUser працює коли user === null (встановлює дані)', () => {
    useAuthStore.getState().updateUser({ firstName: 'Тест' })
    expect(useAuthStore.getState().user?.firstName).toBe('Тест')
  })

  // ── logout ───────────────────────────────────────────────

  it('logout очищає token у стані', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('logout очищає user у стані', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('logout видаляє токен з localStorage', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    useAuthStore.getState().logout()
    expect(localStorage.getItem('token')).toBeNull()
  })

  // ── isAuthenticated ──────────────────────────────────────

  it('isAuthenticated повертає false якщо токена немає', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('isAuthenticated повертає true після setToken', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it('isAuthenticated повертає false після logout', () => {
    useAuthStore.getState().setToken(MOCK_TOKEN)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })
})
