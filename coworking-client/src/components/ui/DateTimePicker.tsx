import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { uk } from 'date-fns/locale'
import { format, isBefore, startOfDay } from 'date-fns'
import { Calendar, Clock, X } from 'lucide-react'
import 'react-day-picker/dist/style.css'

interface Props {
  label:       string
  value:       Date | null
  onChange:    (date: Date | null) => void
  minDate?:    Date
  minHour?:    number  // 8
  maxHour?:    number  // 22
  placeholder?: string
  disabled?:   boolean
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 08–22

export default function DateTimePicker({
  label, value, onChange,
  minDate,
  placeholder = 'Оберіть дату та час...', disabled
}: Props) {
  const [open,        setOpen]        = useState(false)
  const [step,        setStep]        = useState<'day' | 'time'>('day')
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return
    setSelectedDay(day)
    setStep('time')
  }

  const handleHourSelect = (hour: number) => {
    if (!selectedDay) return
    const result = new Date(selectedDay)
    result.setHours(hour, 0, 0, 0)
    onChange(result)
    setOpen(false)
    setStep('day')
  }

  const isHourDisabled = (hour: number) => {
    if (!selectedDay) return false
    const now = new Date()
    const candidate = new Date(selectedDay)
    candidate.setHours(hour, 0, 0, 0)
    return isBefore(candidate, now)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setSelectedDay(undefined)
    setStep('day')
  }

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen(!open); setStep('day') }}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm
          border rounded-xl transition-colors text-left
          ${value
            ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700`}
      >
        <Calendar size={15} className="shrink-0 text-gray-400"/>
        <span className="flex-1 truncate">
          {value
            ? format(value, 'dd MMMM yyyy, HH:mm', { locale: uk })
            : placeholder}
        </span>
        {value && (
          <X size={14} className="shrink-0 text-gray-400 hover:text-gray-700"
            onClick={handleClear}/>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl
          overflow-hidden min-w-[320px]">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2
            border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setStep('day')}
              className={`text-xs font-medium transition-colors flex items-center gap-1 ${
                step === 'day'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Calendar size={12}/>
              {selectedDay
                ? format(selectedDay, 'dd MMMM', { locale: uk })
                : 'Оберіть день'}
            </button>
            {step === 'time' && (
              <>
                <span className="text-gray-300 dark:text-gray-600">›</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white
                  flex items-center gap-1">
                  <Clock size={12}/> Час
                </span>
              </>
            )}
          </div>

          {step === 'day' ? (
            /* ── Day selection ── */
            <div className="p-2">
              <style>{`
                .rdp { --rdp-accent-color: #111827; --rdp-background-color: #f3f4f6; margin: 0; }
                .dark .rdp { --rdp-accent-color: #f9fafb; --rdp-background-color: #374151; }
                .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: white !important; }
                .rdp-day_today { font-weight: 700; }
                .rdp-head_cell { font-size: 11px; color: #9ca3af; font-weight: 500; }
                .rdp-caption_label { font-size: 13px; font-weight: 600; }
                .rdp-nav_button { border-radius: 8px; }
              `}</style>
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={handleDaySelect}
                locale={uk}
                disabled={minDate
                  ? { before: startOfDay(minDate) }
                  : { before: startOfDay(new Date()) }
                }
                showOutsideDays={false}
              />
            </div>
          ) : (
            /* ── Time selection ── */
            <div className="p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 px-1">
                Оберіть час (08:00 – 22:00)
              </p>
              <div className="grid grid-cols-5 gap-1.5 max-h-52 overflow-y-auto">
                {HOURS.map(h => {
                  const dis = isHourDisabled(h)
                  const selected = value
                    && value.getHours() === h
                    && selectedDay
                    && format(value, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')

                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={dis}
                      onClick={() => handleHourSelect(h)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                          : dis
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {String(h).padStart(2, '0')}:00
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
