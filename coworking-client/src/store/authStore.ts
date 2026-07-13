import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import type { User } from '../types'

interface JwtPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress':   string
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role':         string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname':      string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname':        string
}

interface AuthState {
  token:           string | null
  user:            Partial<User> | null
  setToken:        (token: string) => void
  updateUser:      (data: Partial<User>) => void
  logout:          () => void
  isAuthenticated: () => boolean
}

function parseUser(token: string): Partial<User> | null {
  try {
    const d = jwtDecode<JwtPayload>(token)
    return {
      id:        Number(d['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
      email:     d['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role:      d['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as User['role'],
      firstName: d['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
      lastName:  d['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'],
    }
  } catch { return null }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: (() => {
    const t = localStorage.getItem('token')
    return t ? parseUser(t) : null
  })(),

  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token, user: parseUser(token) })
  },

  updateUser: (data) => {
    set(state => ({
      user: state.user ? { ...state.user, ...data } : data
    }))
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },

  isAuthenticated: () => !!get().token,
}))