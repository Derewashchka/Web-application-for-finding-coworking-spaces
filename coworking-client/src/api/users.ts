import api from './axios'

export const getMe = () =>
  api.get('/users/me')

export const updateMe = (data: {
  firstName:        string
  lastName:         string
  phone?:           string
  currentPassword?: string
  newPassword?:     string
}) => api.put('/users/me', data)