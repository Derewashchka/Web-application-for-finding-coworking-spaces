import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay,
  isToday, isPast, format, addMonths, subMonths
} from 'date-fns'
import { uk } from 'date-fns/locale'
import api from '../../api/axios'

interface DaySlot {
  hour:    number
  booked:  number
  total:   number
  free:    number
}

interface Props {
  coworkingId: number
  totalSeats:  number
  onSelectDate?: (date: Date) => void
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8-20

export default function AvailabilityCalendar({
  coworkingId, totalSeats, onSelectDate
}: Props) {
  const [current,      setCurrent]      = useState(new Date())
  const [selected,     setSelected]     = useState<Date | null>(null)
  const [daySlots,     setDaySlots]     = useState<DaySlot[]>([])
  const [busyDays,     setBusyDays]     = useState<Record<string, number>>({})
  const [loadingMonth, setLoadingMonth] = useState(false)
  const [loadingDay,   setLoadingDay]   = useState(false)

  // Завантаження зайнятості по місяцю
  useEffect(() => {
    const load = async () => {
      setLoadingMonth(true)
      try {
        const from = startOfMonth(current).toISOString()
        const to   = endOfMonth(current).toISOString()
        const { data } = await api.get('/bookings/busy-days', {
          params: { coworkingId, from, to }
        })
        setBusyDays(data)
      } catch {
        setBusyDays({})
      } finally {
        setLoadingMonth(false)
      }
    }
    load()
  }, [current, coworkingId])

  // Завантаження слотів конкретного дня
  const loadDay = async (date: Date) => {
    setLoadingDay(true)
    setSelected(date)
    try {
      const { data } = await api.get('/bookings/day-slots', {
        params: {
          coworkingId,
          date: format(date, 'yyyy-MM-dd')
        }
      })
      setDaySlots(data)
    } catch {
      setDaySlots([])
    } finally {
      setLoadingDay(false)
    }
  }

  // Дні для відображення в сітці
  const monthStart = startOfMonth(current)
  const monthEnd   = endOfMonth(current)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd    = endOfWeek(monthEnd,     { weekStartsOn: 1 })
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const getDayColor = (day: Date) => {
    const key   = format(day, 'yyyy-MM-dd')
    const count = busyDays[key] ?? 0
    const pct   = totalSeats > 0 ? count / totalSeats : 0

    if (isPast(day) && !isToday(day)) return 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
    if (pct === 0)   return 'hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300 cursor-pointer'
    if (pct < 0.5)   return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 cursor-pointer'
    if (pct < 1)     return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer'
    return                'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 cursor-not-allowed opacity-70'
  }

  const WEEK_DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд']

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      {/* ── Заголовок ── */}
      <div className="flex items-center justify-between px-4 py-3
        border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button
          onClick={() => setCurrent(subMonths(current, 1))}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-500 dark:text-gray-400"/>
        </button>
        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
          {format(current, 'LLLL yyyy', { locale: uk })}
        </span>
        <button
          onClick={() => setCurrent(addMonths(current, 1))}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight size={16} className="text-gray-500 dark:text-gray-400"/>
        </button>
      </div>

      {/* ── Сітка днів ── */}
      <div className="p-3">
        {/* Назви днів */}
        <div className="grid grid-cols-7 mb-1">
          {WEEK_DAYS.map(d => (
            <div key={d}
              className="text-center text-[11px] font-medium text-gray-400 dark:text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Дні */}
        <div className="grid grid-cols-7 gap-0.5 relative">
          {loadingMonth && (
            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin"/>
            </div>
          )}
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, current)
            const isSelected     = selected && isSameDay(day, selected)
            const colorClass     = getDayColor(day)
            const isPastDay      = isPast(day) && !isToday(day)

            return (
              <button
                key={day.toISOString()}
                disabled={isPastDay}
                onClick={() => {
                  if (!isPastDay) {
                    loadDay(day)
                    onSelectDate?.(day)
                  }
                }}
                className={`
                  relative h-8 w-full rounded-lg text-xs font-medium
                  transition-colors flex items-center justify-center
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isSelected ? 'ring-2 ring-gray-900 dark:ring-white ring-offset-1 dark:ring-offset-gray-900 z-10' : ''}
                  ${isToday(day) ? 'font-bold' : ''}
                  ${colorClass}
                `}
              >
                {format(day, 'd')}
                {isToday(day) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2
                    w-1 h-1 rounded-full bg-current"/>
                )}
              </button>
            )
          })}
        </div>

        {/* Легенда */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800/50">
          {[
            { color: 'bg-green-400', label: 'Є місця' },
            { color: 'bg-amber-400', label: 'Майже зайнято' },
            { color: 'bg-red-400',   label: 'Зайнято' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`}/>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Слоти годин вибраного дня ── */}
      {selected && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            {format(selected, 'dd MMMM yyyy', { locale: uk })} — погодинна зайнятість
          </p>

          {loadingDay ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 py-2">
              <div className="w-3 h-3 border border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-400
                rounded-full animate-spin"/>
              Завантаження...
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {HOURS.map(hour => {
                const slot = daySlots.find(s => s.hour === hour)
                const free = slot ? slot.free : totalSeats
                const pct  = totalSeats > 0
                  ? (totalSeats - free) / totalSeats
                  : 0

                const bg = pct === 0   ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800'
                         : pct < 0.5  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
                         : pct < 1    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                         :              'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-800'

                return (
                  <div key={hour}
                    className={`text-center py-1.5 rounded-lg border text-[10px]
                      font-medium transition-colors ${bg}`}>
                    {hour}:00
                    <div className="text-[9px] opacity-70 mt-0.5">
                      {free}/{totalSeats}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}