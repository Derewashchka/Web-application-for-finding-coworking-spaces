import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCoworkingById } from '../api/coworkings'
import { getReviews, createReview, updateReview, deleteReview } from '../api/reviews'
import { createBooking, checkAvailability, toLocalISOString } from '../api/bookings'
import api from '../api/axios'
import AvailabilityCalendar from '../components/coworkings/AvailabilityCalendar'
import type { Coworking, Review } from '../types'
import { useAuthStore } from '../store/authStore'
import {
  MapPin, Star, Users, Wifi, Coffee,
  Printer, Car, MessageSquare,
  Pencil, Trash2, X, Check,
  AlertCircle, CheckCircle2, Building2
} from 'lucide-react'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'
import DateTimePicker from '../components/ui/DateTimePicker'
import TimeOnlyPicker from '../components/ui/TimeOnlyPicker'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

// ─── Типи ────────────────────────────────────────────────────

interface ReviewWithUser extends Review {
  userId?: number
}

interface Availability {
  totalSeats:        number
  bookedSeats:       number
  availableSeats:    number
  isAvailable:       boolean
  userAlreadyBooked: boolean
}

// ─── Іконки зручностей ───────────────────────────────────────

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi':    <Wifi    size={14}/>,
  'Кава':    <Coffee  size={14}/>,
  'Принтер': <Printer size={14}/>,
  'Паркінг': <Car     size={14}/>,
}

// ─── Компонент одного відгуку ─────────────────────────────────

interface ReviewItemProps {
  review:        ReviewWithUser
  currentUserId?: number
  currentRole?:  string
  coworkingId:   number
  onUpdated:     (r: ReviewWithUser) => void
  onDeleted:     (id: number) => void
}

function ReviewItem({
  review, currentUserId, currentRole,
  coworkingId, onUpdated, onDeleted
}: ReviewItemProps) {
  const [editing,  setEditing]  = useState(false)
  const [rating,   setRating]   = useState(review.rating)
  const [comment,  setComment]  = useState(review.comment ?? '')
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canEdit   = currentUserId === review.userId
  const canDelete = currentUserId === review.userId || currentRole === 'admin'

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateReview(review.id, { coworkingId, rating, comment })
      onUpdated({ ...review, rating, comment })
      setEditing(false)
      toast.success('Відгук оновлено')
    } catch {
      toast.error('Помилка оновлення')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Видалити відгук?')) return
    setDeleting(true)
    try {
      await deleteReview(review.id)
      onDeleted(review.id)
      toast.success('Відгук видалено')
    } catch {
      toast.error('Помилка видалення')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setRating(review.rating)
    setComment(review.comment ?? '')
  }

  return (
    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
      {editing ? (
        /* ── Режим редагування ── */
        <div className="flex flex-col gap-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} type="button" onClick={() => setRating(i + 1)}>
                <Star size={18} className={
                  i < rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700'
                }/>
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Ваш коментар..."
            className="w-full text-sm border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              rounded-lg p-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 
              resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X size={13}/> Скасувати
            </Button>
            <Button size="sm" loading={saving} onClick={handleSave}>
              <Check size={13}/> Зберегти
            </Button>
          </div>
        </div>
      ) : (
        /* ── Режим перегляду ── */
        <div>
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {review.author}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={
                    i < review.rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700'
                  }/>
                ))}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: uk })}
              </span>
            </div>

            {/* Кнопки дій */}
            <div className="flex gap-1 shrink-0">
              {canEdit && (
                <button
                  onClick={() => setEditing(true)}
                  title="Редагувати"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Pencil size={13}/>
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Видалити"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400
                    hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13}/>
                </button>
              )}
            </div>
          </div>

          {review.comment && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Головний компонент ───────────────────────────────────────

export default function CoworkingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuthStore()

  // Дані
  const [cw,       setCw]      = useState<Coworking | null>(null)
  const [reviews, setReviews] = useState<ReviewWithUser[]>([])
  const [loading, setLoading] = useState(true)

  // Організація
  const [orgInfo, setOrgInfo] = useState<{
    id: number; name: string; isPremiumActive: boolean
  } | null>(null)

  // Бронювання
  const [dateFrom,       setDateFrom]      = useState<Date | null>(null)
  const [dateTo,         setDateTo]        = useState<Date | null>(null)
  const [booking,        setBooking]       = useState(false)
  const [availability,  setAvailability]  = useState<Availability | null>(null)
  const [checkingAvail, setCheckingAvail] = useState(false)

  // Новий відгук
  const [rating,     setRating]     = useState(5)
  const [comment,    setComment]    = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── Завантаження даних ──────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const [cwRes, revRes] = await Promise.all([
          getCoworkingById(Number(id)),
          getReviews(Number(id)),
        ])
        setCw(cwRes.data)
        setReviews(revRes.data)

        // Завантаження організації
        if (cwRes.data.organizationId) {
          try {
            const orgRes = await api.get(
              `/organizations/${cwRes.data.organizationId}`
            )
            setOrgInfo({
              id:              orgRes.data.id,
              name:            orgRes.data.name,
              isPremiumActive: orgRes.data.isPremiumActive,
            })
          } catch {}
        }

        // ── Повторне бронювання ──
        const rebook = sessionStorage.getItem('rebook')
        if (rebook) {
          const { dateFrom: df, dateTo: dt } = JSON.parse(rebook)
          setDateFrom(new Date(df))
          setDateTo(new Date(dt))
          sessionStorage.removeItem('rebook')
          toast.success('Дати заповнені з попереднього бронювання')
        }
      } catch {
        toast.error('Помилка завантаження сторінки')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // ── Перевірка доступності з debounce ───────────────────────

  useEffect(() => {
    if (!dateFrom || !dateTo || dateTo <= dateFrom) {
      setAvailability(null)
      return
    }

    const timer = setTimeout(async () => {
      setCheckingAvail(true)
      try {
        const { data } = await checkAvailability(
          Number(id),
          toLocalISOString(dateFrom),
          toLocalISOString(dateTo)
        )
        setAvailability(data)
      } catch {
        setAvailability(null)
      } finally {
        setCheckingAvail(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [dateFrom, dateTo, id])

  // ── Бронювання ──────────────────────────────────────────────

  const handleBook = async () => {
    if (!dateFrom || !dateTo) return toast.error('Оберіть дату та час')
    if (dateTo <= dateFrom) return toast.error('Час кінця має бути після початку')

    setBooking(true)
    try {
      await createBooking({
        coworkingId: Number(id),
        dateFrom:    toLocalISOString(dateFrom!),
        dateTo:      toLocalISOString(dateTo!),
      })
      toast.success('Бронювання успішно створено!')
      setDateFrom(null)
      setDateTo(null)
      setAvailability(null)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Помилка бронювання')
    } finally {
      setBooking(false)
    }
  }

  // ── Відгук ──────────────────────────────────────────────────

  const recalcRating = (updatedReviews: ReviewWithUser[]) => {
    if (!cw) return
    const avg = updatedReviews.length > 0
      ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
      : 0
    setCw({ ...cw, rating: Math.round(avg * 10) / 10 })
  }
  
  const handleReview = async () => {
    setSubmitting(true)
    try {
      await createReview({ coworkingId: Number(id), rating, comment })
      const { data } = await getReviews(Number(id))
      setReviews(data)
      recalcRating(data) 
      setComment('')
      setRating(5)
      toast.success('Відгук додано!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Помилка при додаванні відгуку')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleUpdated = (updated: ReviewWithUser) => {
    const newReviews = reviews.map(r =>
      r.id === updated.id ? { ...r, ...updated } : r
    )
    setReviews(newReviews)
    recalcRating(newReviews)
  }
  
  const handleDeleted = (deletedId: number) => {
    const newReviews = reviews.filter(r => r.id !== deletedId)
    setReviews(newReviews)
    recalcRating(newReviews)
  }

  // ── Рендер ──────────────────────────────────────────────────

  if (loading) return <Spinner/>
  if (!cw) return (
    <div className="text-center py-20 text-gray-400 dark:text-gray-500">
      Коворкінг не знайдено
    </div>
  )

  const amenities = cw.amenities?.split(',').filter(Boolean) ?? []
  const hours = dateFrom && dateTo
    ? Math.max(0, (dateTo.getTime() - dateFrom.getTime()) / 3600000)
    : 0

  const myReview = reviews.find(r => r.userId === user?.id)

  const occupancyPercent = availability
    ? Math.round((availability.bookedSeats / availability.totalSeats) * 100)
    : 0

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ════════════════════════════════
            Ліва колонка
        ════════════════════════════════ */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Фото */}
          <div className="rounded-xl overflow-hidden h-64 bg-gray-50 dark:bg-gray-900">
            <img
              src={cw.photoUrl ||
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'}
              alt={cw.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Заголовок */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{cw.name}</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={13}/>{cw.city}, {cw.address}
              </p>
              {orgInfo && (
                <Link
                  to={`/organizations/${orgInfo.id}`}
                  className="inline-flex items-center gap-1.5 mt-1
                    text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <Building2 size={11}/>
                  {orgInfo.name}
                  {orgInfo.isPremiumActive && (
                    <span className="text-amber-500 text-[10px]">⭐ Premium</span>
                  )}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 mt-1">
              <Star size={14} className="text-amber-400 fill-amber-400"/>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {cw.rating > 0 ? cw.rating.toFixed(1) : 'Новий'}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">({reviews.length})</span>
            </div>
          </div>

          {/* Опис */}
          {cw.description && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Про простір
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {cw.description}
              </p>
            </div>
          )}

          {/* Зручності */}
          {amenities.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Зручності
              </h2>
              <div className="flex flex-wrap gap-2">
                {amenities.map(a => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5
                      bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 
                      rounded-lg text-gray-600 dark:text-gray-400"
                  >
                    {amenityIcons[a.trim()] ?? null}
                    {a.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Доступність
            </h2>
            <AvailabilityCalendar
              coworkingId={cw.id}
              totalSeats={cw.totalSeats}
              onSelectDate={(date) => {
                const d = new Date(date)
                d.setHours(9, 0, 0, 0)
                setDateFrom(d)
                const end = new Date(date)
                end.setHours(18, 0, 0, 0)
                setDateTo(end)
              }}
            />
          </div>

          {/* ── Відгуки ── */}
          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3
              flex items-center gap-2">
              <MessageSquare size={14}/>
              Відгуки ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Поки що відгуків немає. Будьте першим!
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map(r => (
                  <ReviewItem
                    key={r.id}
                    review={r}
                    currentUserId={user?.id}
                    currentRole={user?.role}
                    coworkingId={Number(id)}
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                  />
                ))}
              </div>
            )}

            {/* Форма нового відгуку або підказка */}
            {isAuthenticated() && user?.role === 'client' && (
              myReview ? (
                <div className="mt-4 p-4 border border-amber-100 dark:border-amber-900/50
                  bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    Ви вже залишили відгук для цього коворкінгу.
                    Щоб змінити — натисніть олівець поруч з вашим відгуком вище.
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-4 border border-gray-100 dark:border-gray-800 
                  bg-white dark:bg-gray-900 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Залишити відгук
                  </h3>

                  {/* Зірочки */}
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                      >
                        <Star size={22} className={
                          i < rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700 hover:fill-amber-100 dark:hover:fill-amber-900/50'
                        }/>
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 self-center">
                      {['', 'Жахливо', 'Погано', 'Нормально', 'Добре', 'Відмінно'][rating]}
                    </span>
                  </div>

                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Розкажіть про ваш досвід..."
                    rows={3}
                    className="w-full text-sm border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                      rounded-lg p-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
                      resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />

                  <Button
                    size="sm"
                    className="mt-2"
                    loading={submitting}
                    onClick={handleReview}
                  >
                    Надіслати відгук
                  </Button>
                </div>
              )
            )}
          </div>
        </div>

        {/* ════════════════════════════════
            Права колонка — бронювання
        ════════════════════════════════ */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 border border-gray-100 dark:border-gray-800
            bg-white dark:bg-gray-900 rounded-xl p-5 flex flex-col gap-4">

            {/* Ціна */}
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {cw.pricePerHour} ₴
                </span>
                <span className="text-sm text-gray-400 dark:text-gray-500">/год</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-gray-500">
                <Users size={12}/>
                Всього місць: {cw.totalSeats}
              </div>
            </div>

            {isAuthenticated() && user?.role === 'client' ? (
              <div className="flex flex-col gap-3">

                {/* ── Дата і час початку ── */}
                <DateTimePicker
                  label="Дата та час початку"
                  value={dateFrom}
                  onChange={(d) => {
                    setDateFrom(d)
                    setDateTo(null)
                    setAvailability(null)
                  }}
                  minDate={new Date()}
                  minHour={8}
                  maxHour={22}
                />

                {/* ── Тільки час кінця ── */}
                {dateFrom && (
                  <TimeOnlyPicker
                    label={`Час завершення (${format(dateFrom, 'dd MMMM', { locale: uk })})`}
                    dateBase={dateFrom}
                    value={dateTo}
                    onChange={(d) => {
                      setDateTo(d)
                      setAvailability(null)
                    }}
                    minHour={dateFrom.getHours() + 1}
                    maxHour={23}
                  />
                )}

                {/* Індикатор доступності */}
                {dateFrom && dateTo && dateTo > dateFrom && (
                  <div>
                    {checkingAvail ? (
                      <div className="flex items-center gap-2 text-xs
                        text-gray-400 dark:text-gray-500 px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="w-3 h-3 border border-gray-300 dark:border-gray-600
                          border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin shrink-0"/>
                        Перевіряємо доступність...
                      </div>

                    ) : availability?.userAlreadyBooked ? (
                      <div className="flex items-center gap-1.5 px-3 py-2.5
                        bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-lg
                        text-xs font-medium text-amber-700 dark:text-amber-400">
                        <AlertCircle size={13} className="shrink-0"/>
                        Ви вже маєте бронювання на цей час
                      </div>

                    ) : availability?.isAvailable ? (
                      <div className="px-3 py-2.5 bg-green-50 dark:bg-green-900/20
                        border border-green-100 dark:border-green-900/50 rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs
                          font-medium text-green-700 dark:text-green-400 mb-1.5">
                          <CheckCircle2 size={13}/>
                          Місця доступні
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-green-200 dark:bg-green-900/50
                            rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full
                                transition-all duration-300"
                              style={{ width: `${occupancyPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-500 shrink-0">
                            {availability.availableSeats} з{' '}
                            {availability.totalSeats} вільно
                          </span>
                        </div>
                      </div>

                    ) : availability && !availability.isAvailable ? (
                      <div className="flex items-center gap-1.5 px-3 py-2.5
                        bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg
                        text-xs font-medium text-red-600 dark:text-red-400">
                        <AlertCircle size={13} className="shrink-0"/>
                        Всі {availability.totalSeats} місць зайняті на цей час
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Розрахунок вартості */}
                {hours > 0 && (
                  <div className="flex justify-between items-center text-sm
                    py-2.5 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 dark:text-gray-500">
                      {hours.toFixed(0)} год × {cw.pricePerHour} ₴
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(hours * cw.pricePerHour).toFixed(0)} ₴
                    </span>
                  </div>
                )}

                {/* Кнопка бронювання */}
                <Button
                  loading={booking}
                  onClick={handleBook}
                  disabled={
                    !dateFrom ||
                    !dateTo ||
                    dateTo <= dateFrom ||
                    checkingAvail ||
                    (availability !== null && !availability.isAvailable)
                  }
                  className="w-full"
                >
                  {availability?.userAlreadyBooked
                    ? 'Вже заброньовано на цей час'
                    : availability && !availability.isAvailable
                      ? 'Немає вільних місць'
                      : 'Забронювати'}
                </Button>

              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  Увійдіть як клієнт для бронювання
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                >
                  Увійти
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}