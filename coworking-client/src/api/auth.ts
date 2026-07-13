import api from './axios'

export const login = (email: string, password: string) =>
  api.post<{ token: string }>('/auth/login', { email, password })

export const register = (data: {
  email: string; password: string
  firstName: string; lastName: string
  phone?: string; role: string
}) => api.post<{ token: string }>('/auth/register', data)