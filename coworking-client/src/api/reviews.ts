import api from './axios'

export const getReviews = (coworkingId: number) =>
  api.get(`/reviews/coworking/${coworkingId}`)

export const createReview = (data: {
  coworkingId: number; rating: number; comment?: string
}) => api.post('/reviews', data)

export const updateReview = (id: number, data: {
  coworkingId: number; rating: number; comment?: string
}) => api.put(`/reviews/${id}`, data)

export const deleteReview = (id: number) =>
  api.delete(`/reviews/${id}`)