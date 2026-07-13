export type ContactInfo = Record<string, string>

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'owner' | 'client'
  phone?: string
}

export interface Coworking {
  id: number
  name: string
  city: string
  address: string
  amenities: string
  pricePerHour: number
  rating: number
  description: string
  photoUrl: string
  latitude?: number
  longitude?: number
  totalSeats: number
  isApproved: boolean
}

export interface Booking {
  id: number
  dateFrom: string
  dateTo: string
  status: 'pending' | 'confirmed' | 'cancelled'
  totalPrice: number
  createdAt: string
  coworking: { id: number; name: string; city: string }
}

export interface Review {
  id: number
  rating: number
  comment: string
  createdAt: string
  author: string
}

export interface CoworkingFilter {
  city?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  amenity?: string
}

export interface Notification {
  id:        number
  title:     string
  message:   string
  isRead:    boolean
  type:      'info' | 'success' | 'warning'
  createdAt: string
}

export interface Organization {
  id:              number
  name:            string
  address:         string
  description?:    string
  logoUrl?:        string
  planType:        string
  isPremiumActive: boolean
  premiumUntil?:   string
  createdAt:       string
  coworkingsCount: number
  contacts?:       ContactInfo | null
  coworkings?:     Coworking[]
}