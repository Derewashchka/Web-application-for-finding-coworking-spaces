import api from './axios'
import type { CoworkingFilter } from '../types'

export const getCoworkings = (
  filter?: CoworkingFilter,
  page    = 1,
  pageSize = 9
) => api.get('/coworkings', { params: { ...filter, page, pageSize } })

export const getCoworkingById = (id: number) =>
  api.get(`/coworkings/${id}`)

export const createCoworking = (data: FormData | object) =>
  api.post('/coworkings', data)

export const updateCoworking = (id: number, data: object) =>
  api.put(`/coworkings/${id}`, data)

export const approveCoworking = (id: number) =>
  api.patch(`/coworkings/${id}/approve`)

export const deleteCoworking = (id: number) =>
  api.delete(`/coworkings/${id}`)

export const getPendingCoworkings = () =>
  api.get('/coworkings/pending')

export const getMyCoworkings = () =>
  api.get('/coworkings/my')

export const getTopCoworkings = () =>
  api.get('/coworkings/top')
