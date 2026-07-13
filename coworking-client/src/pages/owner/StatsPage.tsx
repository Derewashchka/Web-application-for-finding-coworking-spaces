import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  getOverview, getRevenueByMonth,
  getBookingsByWeekday, getPopularHours
} from '../../api/stats'
import { getMyOrganization } from '../../api/organizations'
import Spinner from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { TrendingUp, Calendar, Star, Building2, Users, DollarSign, Crown } from 'lucide-react'

interface Overview {
  totalBookings:    number
  confirmedBookings:number
  totalRevenue:     number
  avgRating:        number
  totalReviews:     number
  coworkingsCount:  number
}

export default function StatsPage() {
  const [overview,  setOverview]  = useState<Overview | null>(null)
  const [revenue,   setRevenue]   = useState<any[]>([])
  const [weekday,   setWeekday]   = useState<any[]>([])
  const [hours,     setHours]     = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)

  // Стан для перевірки преміум-плану організації
  const [org, setOrg] = useState<any>(null)
  const [checkingPlan, setCheckingPlan] = useState(true)

  // Стан для темної теми (щоб графіки реагували на перемикання)
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    // Слухаємо зміни класу 'dark' на <html>
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    getMyOrganization()
      .then(r => setOrg(r.data))
      .catch(() => setOrg(null))
      .finally(() => setCheckingPlan(false))
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, rv, wd, hr] = await Promise.all([
          getOverview(),
          getRevenueByMonth(),
          getBookingsByWeekday(),
          getPopularHours(),
        ])
        setOverview(ov.data)
        setRevenue(rv.data)
        setWeekday(wd.data)
        setHours(hr.data)
      } catch {
        // Ігноруємо помилки (наприклад 403), якщо користувач не має преміум
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (checkingPlan) return <Spinner/>

  if (!org?.isPremiumActive) return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Crown size={40} className="mx-auto mb-4 text-amber-400"/>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Статистика доступна лише для Premium
      </h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
        Перейдіть на преміум план щоб отримати доступ до детальної
        аналітики: доходи по місяцях, завантаженість по днях тижня
        та популярні години.
      </p>
      <Link to="/profile">
        <Button>
          <Crown size={14}/> Перейти на Premium
        </Button>
      </Link>
    </main>
  )

  if (loading) return <Spinner/>

  const statCards = [
    {
      icon:  Calendar,
      label: 'Всього бронювань',
      value: overview?.totalBookings ?? 0,
      sub:   `${overview?.confirmedBookings ?? 0} підтверджених`,
      color: 'text-blue-600 dark:text-blue-400',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon:  DollarSign,
      label: 'Загальний дохід',
      value: `${(overview?.totalRevenue ?? 0).toLocaleString('uk')} ₴`,
      sub:   'підтверджені бронювання',
      color: 'text-green-600 dark:text-green-400',
      bg:    'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon:  Star,
      label: 'Середній рейтинг',
      value: overview?.avgRating ?? '—',
      sub:   `${overview?.totalReviews ?? 0} відгуків`,
      color: 'text-amber-600 dark:text-amber-400',
      bg:    'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon:  Building2,
      label: 'Коворкінгів',
      value: overview?.coworkingsCount ?? 0,
      sub:   'у вашій організації',
      color: 'text-purple-600 dark:text-purple-400',
      bg:    'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  // Спільні стилі для Tooltip
  const tooltipStyle = {
    fontSize: 12, 
    borderRadius: 8,
    border: `1px solid ${isDark ? '#374151' : '#f3f4f6'}`,
    backgroundColor: isDark ? '#111827' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#1f2937',
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Статистика</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
          Аналітика ваших коворкінгів
        </p>
      </div>

      {/* ── Картки огляду ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, sub, color, bg }) => (
          <Card key={label} padding="md">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center
              justify-center mb-3`}>
              <Icon size={15} className={color}/>
            </div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
          </Card>
        ))}
      </div>

      {/* ── Дохід по місяцях ── */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} className="text-gray-500 dark:text-gray-400"/>
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            Дохід по місяцях (₴)
          </h2>
        </div>
        {revenue.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">
            Немає даних
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'}/>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(v: any) => [`${Number(v).toLocaleString('uk')} ₴`, 'Дохід']}
                contentStyle={tooltipStyle}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={isDark ? '#f3f4f6' : '#111827'}
                strokeWidth={2}
                dot={{ fill: isDark ? '#f3f4f6' : '#111827', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── По днях тижня ── */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} className="text-gray-500 dark:text-gray-400"/>
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              Завантаженість по днях тижня
            </h2>
          </div>
          {weekday.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">Немає даних</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekday} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'}/>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v: any) => [v, 'Бронювань']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="count" fill={isDark ? '#f3f4f6' : '#111827'} radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ── Популярні години ── */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-gray-500 dark:text-gray-400"/>
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              Популярні години
            </h2>
          </div>
          {hours.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">Немає даних</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hours} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'}/>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v: any) => [v, 'Бронювань']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="count" fill={isDark ? '#9ca3af' : '#6b7280'} radius={[3, 3, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </main>
  )
}