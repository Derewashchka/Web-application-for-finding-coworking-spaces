import api from './axios'

export const getNotifications  = ()        => api.get('/notifications')
export const getUnreadCount    = ()        => api.get('/notifications/unread-count')
export const markRead          = (id: number) => api.patch(`/notifications/${id}/read`)
export const markAllRead       = ()        => api.patch('/notifications/read-all')
export const deleteNotification= (id: number) => api.delete(`/notifications/${id}`)