import { useEffect, useState } from 'react'
import { getAuditLogs } from '../../api/audit'
import Spinner from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Search, ChevronLeft, ChevronRight, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

const ACTION_COLORS: Record<string, 'green'|'red'|'yellow'|'blue'|'gray'> = {
  LOGIN:              'green',
  LOGIN_FAILED:       'red',
  REGISTER:           'blue',
  REGISTER_FAILED:    'red',
  BOOKING_CREATED:    'blue',
  BOOKING_CONFIRMED:  'green',
  BOOKING_CANCELLED:  'yellow',
  COWORKING_APPROVED: 'green',
  COWORKING_DELETED:  'red',
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN:              'Вхід',
  LOGIN_FAILED:       'Невдалий вхід',
  REGISTER:           'Реєстрація',
  REGISTER_FAILED:    'Помилка реєстрації',
  BOOKING_CREATED:    'Бронювання створено',
  BOOKING_CONFIRMED:  'Бронювання підтверджено',
  BOOKING_CANCELLED:  'Бронювання скасовано',
  COWORKING_APPROVED: 'Коворкінг затверджено',
  COWORKING_DELETED:  'Коворкінг видалено',
}

export default function AuditPage() {
  const [logs,       setLogs]       = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [actionF,    setActionF]    = useState('')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await getAuditLogs({
        search:   search || undefined,
        action:   actionF || undefined,
        page:     p,
        pageSize: 20,
      })
      setLogs(data.items)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [])

  const handleSearch = () => { setPage(1); load(1) }

  const handlePage = (p: number) => { setPage(p); load(p) }

  const ACTIONS = Object.keys(ACTION_LABELS)

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={18} className="text-gray-500 dark:text-gray-400"/>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Журнал дій
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {total} подій зафіксовано
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <Card padding="md" className="mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2
              -translate-y-1/2 text-gray-400 dark:text-gray-500"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Email або деталі..."
              className="w-full pl-8 pr-3 py-2 text-sm
                border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
                placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
          </div>

          <select
            value={actionF}
            onChange={e => setActionF(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2
              focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">Всі дії</option>
            {ACTIONS.map(a => (
              <option key={a} value={a}>{ACTION_LABELS[a]}</option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm
              rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
          >
            Пошук
          </button>
        </div>
      </Card>

      {/* ── Table ── */}
      {loading ? <Spinner/> : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          Жодної події не знайдено
        </div>
      ) : (
        <>
          <Card padding="none" className="bg-white dark:bg-gray-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Час','Користувач','Дія','Деталі','IP'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs
                      font-medium text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {logs.map(log => (
                  <tr key={log.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {format(new Date(log.createdAt),
                        'dd.MM.yy HH:mm:ss', { locale: uk })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                        {log.userEmail}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ACTION_COLORS[log.action] ?? 'gray'}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400
                      max-w-xs truncate" title={log.details ?? ''}>
                      {log.details ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500
                      font-mono">
                      {log.ipAddress ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => handlePage(page - 1)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                  hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors
                  text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft size={14}/>
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => handlePage(page + 1)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                  hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors
                  text-gray-600 dark:text-gray-400"
              >
                <ChevronRight size={14}/>
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}