import api from './axios'
import type { ContactInfo } from '../types'

export interface OrgPayload {
  name:        string
  address:     string
  description?: string
  logoUrl?:     string
  contacts?:    ContactInfo
}

export const getOrganization    = (id: number) =>
  api.get(`/organizations/${id}`)

export const getMyOrganization  = () =>
  api.get('/organizations/my')

export const createOrganization = (data: OrgPayload) =>
  api.post('/organizations', data)

export const updateOrganization = (data: OrgPayload) =>
  api.put('/organizations/my', data)

export const upgradeToPremium   = () =>
  api.post('/organizations/upgrade')