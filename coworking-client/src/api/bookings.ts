import api from './axios'

export const getMyBookings = () =>
  api.get('/bookings/my')

export const createBooking = (data: {
  coworkingId: number
  dateFrom: string
  dateTo: string
}) => api.post('/bookings', data)

export const cancelBooking = (id: number) =>
  api.patch(`/bookings/${id}/cancel`)

export const getAllBookings = () =>
  api.get('/bookings/all')

export const confirmBooking = (id: number) =>
  api.patch(`/bookings/${id}/confirm`)

export const checkAvailability = (
  coworkingId: number,
  dateFrom: string,
  dateTo: string
) => api.get('/bookings/availability', {
  params: { coworkingId, dateFrom, dateTo }
})

export const toLocalISOString = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}` +
         `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

export const getBookingsForMyCoworkings = () =>
  api.get('/bookings/my-coworkings')