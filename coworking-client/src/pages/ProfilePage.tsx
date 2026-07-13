import { useEffect, useState, useMemo } from 'react'
import type { Booking, Coworking } from '../types'
import {
  getMyBookings, cancelBooking, confirmBooking,
  getBookingsForMyCoworkings
} from '../api/bookings'
import { getMyCoworkings } from '../api/coworkings'
import { getMe } from '../api/users'
import { getMyOrganization } from '../api/organizations'
import { useAuthStore } from '../store/authStore'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Card, {
  CardHeader, CardTitle, CardDescription, CardFooter
} from '../components/ui/Card'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import {
  LogOut, Calendar, MapPin, Clock, CreditCard,
  Plus, Building2, CheckCircle, Pencil, Eye,
  RotateCcw, QrCode, Search,
  ChevronLeft, ChevronRight, Globe
} from 'lucide-react'
import BookingQR from '../components/bookings/BookingQR'
import EditProfileModal from '../components/profile/EditProfileModal'
import OrganizationModal from '../components/organization/OrganizationModal'
import PremiumCard       from '../components/organization/PremiumCard'

// ─── Константи ───────────────────────────────────────────────

const BOOKINGS_PER_PAGE   = 5
const COWORKINGS_PER_PAGE = 6

const statusMap = {
  confirmed: { label: 'Підтверджено', variant: 'green'  as const },
  pending:   { label: 'Очікує',       variant: 'yellow' as const },
  cancelled: { label: 'Скасовано',    variant: 'red'    as const },
}

// ─── Хук пагінації ───────────────────────────────────────────

function usePagination<T>(items: T[], perPage: number) {
  const [page, setPage] = useState(1)

  // Скидаємо сторінку при зміні списку
  useEffect(() => { setPage(1) }, [items.length])

  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const paginated  = items.slice((page - 1) * perPage, page * perPage)

  return { page, setPage, totalPages, paginated }
}

// ─── Компонент пагінації ─────────────────────────────────────

function Pagination({
  page, totalPages, onChange
}: {
  page: number; totalPages: number; onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors
          text-gray-600 dark:text-gray-400"
      >
        <ChevronLeft size={13}/>
      </button>

      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p =>
            p === 1 || p === totalPages || Math.abs(p - page) <= 1
          )
          .reduce<(number|'...')[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i-1] as number) > 1)
              acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) => p === '...' ? (
            <span key={`d${i}`}
              className="w-7 h-7 flex items-center justify-center
                text-xs text-gray-400 dark:text-gray-600">…</span>
          ) : (
            <button key={p} onClick={() => onChange(p as number)}
              className={`w-7 h-7 rounded-lg text-xs font-medium
                transition-colors ${
                page === p
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              {p}
            </button>
          ))
        }
      </div>

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors
          text-gray-600 dark:text-gray-400"
      >
        <ChevronRight size={13}/>
      </button>
    </div>
  )
}

// ─── Компонент пошуку ─────────────────────────────────────────

function SearchInput({
  value, onChange, placeholder
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <Search size={13} className="absolute left-3 top-1/2
        -translate-y-1/2 text-gray-400 dark:text-gray-500"/>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Пошук...'}
        className="w-full pl-8 pr-3 py-2 text-sm
          border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
          placeholder:text-gray-400 dark:placeholder:text-gray-600"
      />
    </div>
  )
}

// ─── Головний компонент ───────────────────────────────────────

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [bookings,   setBookings]   = useState<Booking[]>([])
  const [coworkings, setCoworkings] = useState<Coworking[]>([])
  const [loadingB,   setLoadingB]   = useState(true)
  const [loadingC,   setLoadingC]   = useState(true)
  
  // Стейт для модалки редагування профілю
  const [editOpen, setEditOpen] = useState(false)

  // Стан для організації
  const [org,      setOrg]      = useState<any>(null)
  const [loadOrg, setLoadOrg] = useState(true)
  const [orgOpen, setOrgOpen] = useState(false)

  // Пошук
  const [bookingSearch,   setBookingSearch]   = useState('')
  const [coworkingSearch, setCoworkingSearch] = useState('')

  // Завантаження бронювань (client)
  useEffect(() => {
    if (user?.role !== 'client') { setLoadingB(false); return }
    getMyBookings()
      .then(r => setBookings(r.data))
      .finally(() => setLoadingB(false))
  }, [user?.role])

  // Завантаження коворкінгів (owner/admin)
  useEffect(() => {
    if (user?.role !== 'owner' && user?.role !== 'admin') {
      setLoadingC(false); return
    }
    getMyCoworkings()
      .then(r => setCoworkings(r.data))
      .finally(() => setLoadingC(false))
  }, [user?.role])

  // Завантаження організації
  useEffect(() => {
    if (user?.role !== 'owner') { setLoadOrg(false); return }
    getMyOrganization()
      .then(r  => setOrg(r.data))
      .catch(() => setOrg(null))
      .finally(() => setLoadOrg(false))
  }, [user?.role])

  // ── Фільтровані списки ──────────────────────────────────────

  const filteredBookings = useMemo(() =>
    bookings.filter(b =>
      b.coworking.name.toLowerCase()
        .includes(bookingSearch.toLowerCase())
    ), [bookings, bookingSearch])

  const filteredCoworkings = useMemo(() =>
    coworkings.filter(c =>
      c.name.toLowerCase()
        .includes(coworkingSearch.toLowerCase()) ||
      c.city.toLowerCase()
        .includes(coworkingSearch.toLowerCase())
    ), [coworkings, coworkingSearch])

  // ── Пагінація ───────────────────────────────────────────────

  const bookingPag   = usePagination(filteredBookings,   BOOKINGS_PER_PAGE)
  const coworkingPag = usePagination(filteredCoworkings, COWORKINGS_PER_PAGE)

  // ── Handlers ────────────────────────────────────────────────

  const handleProfileSaved = () => {
    // Дані вже оновлені в store через setToken/updateUser
    // Нічого більше не потрібно
  }

  const handleCancel = async (id: number) => {
    try {
      await cancelBooking(id)
      setBookings(prev =>
        prev.map(b =>
          b.id === id ? { ...b, status: 'cancelled' as const } : b
        )
      )
      toast.success('Бронювання скасовано')
    } catch { toast.error('Помилка скасування') }
  }

  const handleConfirm = async (id: number) => {
    try {
      await confirmBooking(id)
      setBookings(prev =>
        prev.map(b =>
          b.id === id ? { ...b, status: 'confirmed' as const } : b
        )
      )
      toast.success('Бронювання підтверджено')
    } catch { toast.error('Помилка') }
  }

  const handleRebook = (b: Booking) => {
    const dateFrom = new Date(b.dateFrom)
    const dateTo   = new Date(b.dateTo)
    const now      = new Date()

    let newFrom = new Date(dateFrom)
    if (newFrom <= now) {
      newFrom = new Date(now)
      newFrom.setDate(newFrom.getDate() + 1)
      newFrom.setHours(dateFrom.getHours(), 0, 0, 0)
    }
    const duration = dateTo.getTime() - dateFrom.getTime()
    const newTo    = new Date(newFrom.getTime() + duration)

    sessionStorage.setItem('rebook', JSON.stringify({
      dateFrom: newFrom.toISOString(),
      dateTo:   newTo.toISOString(),
    }))
    navigate(`/coworkings/${b.coworking.id}`)
  }

  const handleLogout = () => { logout(); navigate('/') }

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const pendingCount   = bookings.filter(b => b.status === 'pending').length

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 bg-white dark:bg-gray-950 min-h-screen">

      {/* ══════════════════════════════
          Картка профілю
      ══════════════════════════════ */}
      <Card padding="md">
        <CardHeader
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil size={14}/> Редагувати
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut size={14}/> Вийти
              </Button>
            </div>
          }
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-gray-800
              flex items-center justify-center text-white dark:text-gray-200
              text-sm font-medium shrink-0">
              {(user?.firstName?.[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <CardTitle>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split('@')[0]}
              </CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <Badge variant={
          user?.role === 'admin'  ? 'blue'   :
          user?.role === 'owner'  ? 'yellow' : 'gray'
        }>
          {user?.role === 'client' ? 'Клієнт'
            : user?.role === 'owner' ? 'Власник'
            : 'Адміністратор'}
        </Badge>

        {/* Статистика для client */}
        {user?.role === 'client' && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4
            border-t border-gray-50 dark:border-gray-800/50">
            {[
              { label: 'Всього',       value: bookings.length },
              { label: 'Підтверджено', value: confirmedCount  },
              { label: 'Очікує',       value: pendingCount    },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {value}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Кнопки для owner */}
        {user?.role === 'owner' && (
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
            <Link to="/add-coworking">
              <Button variant="outline" size="sm" className="w-full">
                <Plus size={14}/> Додати коворкінг
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* ══════════════════════════════
          Організація (owner)
      ══════════════════════════════ */}
      {user?.role === 'owner' && (
        <div>
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3
            flex items-center gap-2">
            <Building2 size={14}/> Моя організація
          </h2>

          {loadOrg ? <Spinner/> : !org ? (

            /* Немає організації — пропонуємо створити */
            <Card padding="md">
              <div className="text-center py-4">
                <Building2 size={28} className="mx-auto mb-2 text-gray-200 dark:text-gray-800"/>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  У вас ще немає організації
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  Створіть організацію щоб додавати коворкінги
                </p>
                <Button size="sm" onClick={() => setOrgOpen(true)}>
                  <Plus size={14}/> Створити організацію
                </Button>
              </div>
            </Card>

          ) : (

            /* Є організація */
            <div className="flex flex-col gap-3">
              <Card padding="md">
                <CardHeader
                  action={
                    <Button variant="outline" size="sm"
                      onClick={() => setOrgOpen(true)}>
                      <Pencil size={13}/> Редагувати
                    </Button>
                  }
                >
                  <div className="flex items-center gap-3">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt={org.name}
                        className="w-10 h-10 rounded-lg object-cover
                          border border-gray-100 dark:border-gray-700"/>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800
                        flex items-center justify-center shrink-0">
                        <Building2 size={16} className="text-gray-400 dark:text-gray-500"/>
                      </div>
                    )}
                    <div>
                      <CardTitle>{org.name}</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-1">
                          <MapPin size={11}/>{org.address}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {org.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {org.description}
                  </p>
                )}

                {org.website && (
                  <a href={org.website} target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400
                      hover:underline mt-2">
                    <Globe size={11}/>{org.website}
                  </a>
                )}

                <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800/50">
                  <Link
                    to={`/organizations/${org.id}`}
                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
                      transition-colors"
                  >
                    Публічна сторінка →
                  </Link>
                </div>
              </Card>

              {/* Преміум блок */}
              <PremiumCard
                isPremium={org.isPremiumActive}
                premiumUntil={org.premiumUntil}
                onUpgraded={() => {
                  getMyOrganization()
                    .then(r => setOrg(r.data))
                    .catch(() => {})
                }}
              />
            </div>
          )}

          {/* Модалка організації */}
          {orgOpen && (
            <OrganizationModal
              existing={org}
              onClose={() => setOrgOpen(false)}
              onSaved={updated => setOrg(updated)}
            />
          )}
        </div>
      )}

      {/* ══════════════════════════════
          Мої коворкінги (owner/admin)
      ══════════════════════════════ */}
      {(user?.role === 'owner' || user?.role === 'admin') && (
        <div>
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3
            flex items-center gap-2">
            <Building2 size={14}/> Мої коворкінги
            <span className="text-gray-400 dark:text-gray-500 font-normal">
              ({filteredCoworkings.length})
            </span>
          </h2>

          {/* Пошук по коворкінгах */}
          <div className="mb-3">
            <SearchInput
              value={coworkingSearch}
              onChange={setCoworkingSearch}
              placeholder="Пошук за назвою або містом..."
            />
          </div>

          {loadingC ? <Spinner/> : filteredCoworkings.length === 0 ? (
            <Card padding="md">
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <p className="text-sm">
                  {coworkingSearch
                    ? 'Нічого не знайдено'
                    : 'У вас ще немає коворкінгів'}
                </p>
                {!coworkingSearch && (
                  <Link to="/add-coworking">
                    <Button variant="outline" size="sm" className="mt-4">
                      <Plus size={14}/> Додати перший
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {coworkingPag.paginated.map(c => (
                  <Card key={c.id} padding="md">
                    <CardHeader
                      action={
                        <Badge variant={c.isApproved ? 'green' : 'yellow'}>
                          {c.isApproved ? 'Затверджено' : 'На модерації'}
                        </Badge>
                      }
                    >
                      <CardTitle>{c.name}</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-1">
                          <MapPin size={11}/>
                          {c.city}, {c.address}
                        </span>
                      </CardDescription>
                    </CardHeader>

                    <div className="flex items-center gap-4
                      text-xs text-gray-400 dark:text-gray-500">
                      <span>{c.pricePerHour} ₴/год</span>
                      <span>{c.totalSeats} місць</span>
                      {c.rating > 0 && <span>★ {c.rating}</span>}
                    </div>

                    <CardFooter>
                      <div className="flex gap-2">
                        <Link to={`/coworkings/${c.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye size={13}/> Переглянути
                          </Button>
                        </Link>
                        <Link to={`/edit-coworking/${c.id}`}>
                          <Button variant="outline" size="sm">
                            <Pencil size={13}/> Редагувати
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <Pagination
                page={coworkingPag.page}
                totalPages={coworkingPag.totalPages}
                onChange={coworkingPag.setPage}
              />
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════
          Мої бронювання (client)
      ══════════════════════════════ */}
      {user?.role === 'client' && (
        <div>
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3
            flex items-center gap-2">
            <Calendar size={14}/> Мої бронювання
            <span className="text-gray-400 dark:text-gray-500 font-normal">
              ({filteredBookings.length})
            </span>
          </h2>

          {/* Пошук по бронюваннях */}
          <div className="mb-3">
            <SearchInput
              value={bookingSearch}
              onChange={setBookingSearch}
              placeholder="Пошук за назвою коворкінгу..."
            />
          </div>

          {loadingB ? <Spinner/> : filteredBookings.length === 0 ? (
            <Card padding="md">
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <p className="text-sm">
                  {bookingSearch
                    ? 'Нічого не знайдено'
                    : 'У вас ще немає бронювань'}
                </p>
                {!bookingSearch && (
                  <Button
                    variant="outline" size="sm" className="mt-4"
                    onClick={() => navigate('/catalog')}
                  >
                    Переглянути каталог
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {bookingPag.paginated.map(b => {
                  const s = statusMap[b.status]
                  return (
                    <Card key={b.id} padding="md">
                      <CardHeader
                        action={
                          <Badge variant={s.variant}>{s.label}</Badge>
                        }
                      >
                        <CardTitle>{b.coworking.name}</CardTitle>
                        <CardDescription>
                          <span className="flex items-center gap-1">
                            <MapPin size={11}/>{b.coworking.city}
                          </span>
                        </CardDescription>
                      </CardHeader>

                      <div className="flex flex-col gap-1.5
                        text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock size={11}/>
                          {format(new Date(b.dateFrom),
                            'dd MMM yyyy, HH:mm', { locale: uk })}
                          {' — '}
                          {format(new Date(b.dateTo),
                            'dd MMM yyyy, HH:mm', { locale: uk })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CreditCard size={11}/>{b.totalPrice} ₴
                        </span>
                      </div>

                      {/* Дії */}
                      <div className="flex items-center gap-4 mt-3">
                        {(b.status === 'confirmed' ||
                          b.status === 'cancelled') && (
                          <button
                            onClick={() => handleRebook(b)}
                            className="flex items-center gap-1 text-xs
                              text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
                              transition-colors"
                          >
                            <RotateCcw size={11}/>
                            Забронювати знову
                          </button>
                        )}
                        <BookingQR booking={b}/>
                      </div>

                      {b.status === 'pending' && (
                        <CardFooter>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Очікує підтвердження
                          </span>
                          <Button
                            variant="danger" size="sm"
                            onClick={() => handleCancel(b.id)}
                          >
                            Скасувати
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  )
                })}
              </div>

              <Pagination
                page={bookingPag.page}
                totalPages={bookingPag.totalPages}
                onChange={bookingPag.setPage}
              />
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════
          Бронювання клієнтів (owner)
      ══════════════════════════════ */}
      {user?.role === 'owner' && (
        <OwnerBookings/>
      )}

      {/* Модальне вікно редагування профілю */}
      {editOpen && (
        <EditProfileModal
          onClose={() => setEditOpen(false)}
          onSaved={handleProfileSaved}
        />
      )}
    </main>
  )
}

// ─── Бронювання клієнтів для owner ───────────────────────────

function OwnerBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<
    'all'|'pending'|'confirmed'|'cancelled'
  >('pending')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getBookingsForMyCoworkings()
      .then(r => setBookings(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = filter === 'all'
      ? bookings
      : bookings.filter(b => b.status === filter)
    if (search)
      list = list.filter(b =>
        b.coworking.name.toLowerCase().includes(search.toLowerCase()) ||
        `${b.user.firstName} ${b.user.lastName}`
          .toLowerCase().includes(search.toLowerCase())
      )
    return list
  }, [bookings, filter, search])

  const { page, setPage, totalPages, paginated } =
    usePagination(filtered, BOOKINGS_PER_PAGE)

  const handleCancel = async (id: number) => {
    try {
      await cancelBooking(id)
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
      )
      toast.success('Скасовано')
    } catch { toast.error('Помилка') }
  }

  const handleConfirm = async (id: number) => {
    try {
      await confirmBooking(id)
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b)
      )
      toast.success('Підтверджено')
    } catch { toast.error('Помилка') }
  }

  const tabs = [
    { key: 'pending'    as const, label: 'Очікують' },
    { key: 'confirmed'  as const, label: 'Підтверджені' },
    { key: 'cancelled'  as const, label: 'Скасовані' },
    { key: 'all'        as const, label: 'Всі' },
  ]

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3
        flex items-center gap-2">
        <Calendar size={14}/> Бронювання клієнтів
        {pendingCount > 0 && (
          <span className="text-xs text-amber-500 dark:text-amber-400 font-normal">
            ({pendingCount} нових)
          </span>
        )}
      </h2>

      {/* Пошук */}
      <div className="mb-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Пошук за коворкінгом або клієнтом..."
        />
      </div>

      {/* Фільтр статусу */}
      <div className={`flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit mb-4`}>
        {tabs.map(t => (
          <button key={t.key}
            onClick={() => { setFilter(t.key); setPage(1) }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === t.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {t.label}
            {t.key === 'pending' && pendingCount > 0 && (
              <span className="ml-1 text-amber-500 dark:text-amber-400">
                ({pendingCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Spinner/> : filtered.length === 0 ? (
        <Card padding="md">
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
            {search ? 'Нічого не знайдено' : 'Немає бронювань'}
          </p>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {paginated.map((b: any) => {
              const s = statusMap[b.status as keyof typeof statusMap]
              return (
                <Card key={b.id} padding="md">
                  <CardHeader
                    action={<Badge variant={s.variant}>{s.label}</Badge>}
                  >
                    <CardTitle>{b.coworking.name}</CardTitle>
                    <CardDescription>
                      <span className="flex items-center gap-1">
                        <MapPin size={11}/>{b.coworking.city}
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <div className="flex flex-col gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={11}/>
                      {b.user.firstName} {b.user.lastName}
                      {b.user.phone && (
                        <span className="text-gray-300 dark:text-gray-600">
                          · {b.user.phone}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={11}/>
                      {format(new Date(b.dateFrom),
                        'dd MMM yyyy, HH:mm', { locale: uk })}
                      {' — '}
                      {format(new Date(b.dateTo),
                        'dd MMM yyyy, HH:mm', { locale: uk })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CreditCard size={11}/>{b.totalPrice} ₴
                    </span>
                  </div>

                  {b.status === 'pending' && (
                    <CardFooter>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Очікує підтвердження
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => handleCancel(b.id)}>
                          Скасувати
                        </Button>
                        <Button size="sm"
                          onClick={() => handleConfirm(b.id)}>
                          <CheckCircle size={13}/> Підтвердити
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              )
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  )
}