import api from './axios'

export const getAuditLogs = (params?: {
  action?:   string
  entity?:   string
  search?:   string
  page?:     number
  pageSize?: number
}) => api.get('/audit', { params })