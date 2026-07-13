import { useEffect, useState, useMemo } from 'react'
import type { Coworking } from '../../types'
import {
  getPendingCoworkings, approveCoworking, deleteCoworking
} from '../../api/coworkings'
import { getAllBookings, confirmBooking, cancelBooking } from '../../api/bookings'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Card, { CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card'
import toast from 'react-hot-toast'
import {
  CheckCircle, Trash2, MapPin,
  Calendar, Users, Clock, CreditCard,
  ChevronLeft, ChevronRight, Shield, Search
} from 'lucide-react'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { Link } from 'react-router-dom'

// ─── Типи ────────────────────────────────────────────────────

interface BookingAdmin {
  id:         number
  dateFrom:   string
  dateTo:     string
  status:     'pending' | 'confirmed' | 'cancelled'
  totalPrice: number
  createdAt:  string
  coworking:  { id: number; name: string; city: string }
  user:       { id: number; firstName: string; lastName: string; email: string }
}

type Tab = 'coworkings' | 'bookings'

const statusMap = {
  confirmed: { label: 'Підтверджено', variant: 'green'  as const },
  pending:   { label: 'Очікує',       variant: 'yellow' as const },
  cancelled: { label: 'Скасовано',    variant: 'red'    as const },
}

// ─── Компонент пагінації ─────────────────────────────────────

function Pagination({
  page, totalPages, onChange
}: {
  page: number; totalPages: number; onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
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
          .reduce<(number | '...')[]>((acc, p, i, arr) => {
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

      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
        {page} / {totalPages}
      </span>
    </div>
  )
}

const PER_PAGE = 10

// ─── Головний компонент ───────────────────────────────────────

export default function AdminPage() {
  const [tab,        setTab]        = useState<Tab>('coworkings')
  const [coworkings, setCoworkings] = useState<Coworking[]>([])
  const [bookings,   setBookings]   = useState<BookingAdmin[]>([])
  const [loading,    setLoading]    = useState(true)

  // Пошук
  const [cwSearch,    setCwSearch]    = useState('')
  const [bookSearch,  setBookSearch]  = useState('')
  const [bookStatus,  setBookStatus]  = useState<
    'all'|'pending'|'confirmed'|'cancelled'
  >('all')

  // Пагінація
  const [cwPage,   setCwPage]   = useState(1)
  const [bookPage, setBookPage] = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (tab === 'coworkings') {
          const { data } = await getPendingCoworkings()
          setCoworkings(data)
          setCwPage(1)
        } else {
          const { data } = await getAllBookings()
          setBookings(data)
          setBookPage(1)
        }
      } finally { setLoading(false) }
    }
    load()
  }, [tab])

  // ── Фільтровані коворкінги ──────────────────────────────────
  const filteredCw = useMemo(() =>
    coworkings.filter(c =>
      c.name.toLowerCase().includes(cwSearch.toLowerCase()) ||
      c.city.toLowerCase().includes(cwSearch.toLowerCase())
    ), [coworkings, cwSearch])

  const cwTotalPages = Math.max(1, Math.ceil(filteredCw.length / PER_PAGE))
  const cwPaginated  = filteredCw.slice(
    (cwPage - 1) * PER_PAGE, cwPage * PER_PAGE
  )

  // ── Фільтровані бронювання ──────────────────────────────────
  const filteredBook = useMemo(() => {
    let list = bookStatus === 'all'
      ? bookings
      : bookings.filter(b => b.status === bookStatus)
    if (bookSearch)
      list = list.filter(b =>
        b.coworking.name.toLowerCase()
          .includes(bookSearch.toLowerCase()) ||
        `${b.user.firstName} ${b.user.lastName}`
          .toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.user.email.toLowerCase()
          .includes(bookSearch.toLowerCase())
      )
    return list
  }, [bookings, bookStatus, bookSearch])

  const bookTotalPages = Math.max(1, Math.ceil(filteredBook.length / PER_PAGE))
  const bookPaginated  = filteredBook.slice(
    (bookPage - 1) * PER_PAGE, bookPage * PER_PAGE
  )

  // ── Handlers ────────────────────────────────────────────────

  const handleApprove = async (id: number) => {
    try {
      await approveCoworking(id)
      setCoworkings(prev =>
        prev.map(c => c.id === id ? { ...c, isApproved: true } : c)
      )
      toast.success('Коворкінг затверджено')
    } catch { toast.error('Помилка') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити коворкінг?')) return
    try {
      await deleteCoworking(id)
      setCoworkings(prev => prev.filter(c => c.id !== id))
      toast.success('Видалено')
    } catch { toast.error('Помилка видалення') }
  }

  const handleConfirmBooking = async (id: number) => {
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

  const handleCancelBooking = async (id: number) => {
    try {
      await cancelBooking(id)
      setBookings(prev =>
        prev.map(b =>
          b.id === id ? { ...b, status: 'cancelled' as const } : b
        )
      )
      toast.success('Бронювання скасовано')
    } catch { toast.error('Помилка') }
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  const tabs: { key: Tab; label: string }[] = [
    { key: 'coworkings', label: 'Коворкінги' },
    { key: 'bookings',   label: 'Бронювання' },
  ]

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Шапка ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Адмін-панель
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {tab === 'coworkings'
              ? `${filteredCw.length} коворкінгів`
              : `${filteredBook.length} бронювань`}
          </p>
        </div>

        {/* Кнопка журналу дій */}
        <Link to="/audit">
          <Button variant="outline" size="sm">
            <Shield size={14}/> Журнал дій
          </Button>
        </Link>
      </div>

      {/* ── Таби ── */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {t.label}
            {t.key === 'bookings' && pendingCount > 0 && (
              <span className="ml-1.5 text-xs text-amber-500 dark:text-amber-400">
                ({pendingCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Spinner/> : (

        /* ════════ КОВОРКІНГИ ════════ */
        tab === 'coworkings' ? (
          <div>
            {/* Пошук */}
            <div className="relative mb-4">
              <Search size={13} className="absolute left-3 top-1/2
                -translate-y-1/2 text-gray-400 dark:text-gray-500"/>
              <input
                value={cwSearch}
                onChange={e => { setCwSearch(e.target.value); setCwPage(1) }}
                placeholder="Пошук за назвою або містом..."
                className="w-full pl-8 pr-3 py-2 text-sm
                  border border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
                  placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>

            <Card padding="none" className="bg-white dark:bg-gray-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    {['Назва','Місто','Ціна','Рейтинг','Статус','Дії'].map(h => (
                      <th key={h}
                        className="text-left px-4 py-3 text-xs
                          font-medium text-gray-500 dark:text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {cwPaginated.length === 0 ? (
                    <tr>
                      <td colSpan={6}
                        className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                        {cwSearch
                          ? 'Нічого не знайдено'
                          : 'Немає коворкінгів'}
                      </td>
                    </tr>
                  ) : cwPaginated.map(c => (
                    <tr key={c.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={11}/>{c.city}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {c.pricePerHour} ₴/год
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {c.rating > 0 ? `★ ${c.rating}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={c.isApproved ? 'green' : 'yellow'}>
                          {c.isApproved ? 'Затверджено' : 'На модерації'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!c.isApproved && (
                            <Button size="sm" variant="outline"
                              onClick={() => handleApprove(c.id)}>
                              <CheckCircle size={13}/> Затвердити
                            </Button>
                          )}
                          <Button size="sm" variant="danger"
                            onClick={() => handleDelete(c.id)}>
                            <Trash2 size={13}/>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Pagination
              page={cwPage}
              totalPages={cwTotalPages}
              onChange={p => setCwPage(p)}
            />
          </div>

        ) : (

          /* ════════ БРОНЮВАННЯ ════════ */
          <div>
            {/* Пошук + фільтр статусу */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={13} className="absolute left-3 top-1/2
                  -translate-y-1/2 text-gray-400 dark:text-gray-500"/>
                <input
                  value={bookSearch}
                  onChange={e => {
                    setBookSearch(e.target.value)
                    setBookPage(1)
                  }}
                  placeholder="Пошук за коворкінгом або клієнтом..."
                  className="w-full pl-8 pr-3 py-2 text-sm
                    border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800
                    text-gray-900 dark:text-gray-100
                    rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
                    placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
              </div>
              <select
                value={bookStatus}
                onChange={e => {
                  setBookStatus(e.target.value as typeof bookStatus)
                  setBookPage(1)
                }}
                className="text-sm border border-gray-200 dark:border-gray-700
                  rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="all">Всі статуси</option>
                <option value="pending">Очікують</option>
                <option value="confirmed">Підтверджені</option>
                <option value="cancelled">Скасовані</option>
              </select>
            </div>

            {bookPaginated.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                {bookSearch || bookStatus !== 'all'
                  ? 'Нічого не знайдено'
                  : 'Немає бронювань'}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bookPaginated.map(b => {
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
                          <Users size={11}/>
                          {b.user.firstName} {b.user.lastName}
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          {b.user.email}
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
                          <CreditCard size={11}/>
                          {b.totalPrice} ₴
                        </span>
                      </div>

                      {b.status === 'pending' && (
                        <CardFooter>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Очікує підтвердження
                          </span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline"
                              onClick={() => handleCancelBooking(b.id)}>
                              Скасувати
                            </Button>
                            <Button size="sm"
                              onClick={() => handleConfirmBooking(b.id)}>
                              <CheckCircle size={13}/> Підтвердити
                            </Button>
                          </div>
                        </CardFooter>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}

            <Pagination
              page={bookPage}
              totalPages={bookTotalPages}
              onChange={p => setBookPage(p)}
            />
          </div>
        )
      )}
    </main>
  )
}