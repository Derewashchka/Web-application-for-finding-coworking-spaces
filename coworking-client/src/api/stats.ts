import api from './axios'

export const getOverview        = () => api.get('/stats/overview')
export const getRevenueByMonth  = () => api.get('/stats/revenue-by-month')
export const getBookingsByWeekday = () => api.get('/stats/bookings-by-weekday')
export const getPopularHours    = () => api.get('/stats/popular-hours')