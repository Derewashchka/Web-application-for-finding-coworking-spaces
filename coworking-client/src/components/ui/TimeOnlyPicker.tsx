import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Clock, X } from 'lucide-react'

interface Props {
  label:    string
  dateBase: Date
  value:    Date | null
  onChange: (date: Date | null) => void
  minHour:  number
  maxHour:  number
}

export default function TimeOnlyPicker({
  label, dateBase, value, onChange, minHour, maxHour
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const HOURS = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => i + minHour
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (hour: number) => {
    const result = new Date(dateBase)
    result.setHours(hour, 0, 0, 0)
    onChange(result)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm
          border rounded-xl transition-colors text-left
          ${value
            ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400'}
          hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200`}
      >
        <Clock size={15} className="shrink-0 text-gray-400"/>
        <span className="flex-1">
          {value ? format(value, 'HH:mm') : 'Оберіть час завершення'}
        </span>
        {value && (
          <X size={14} className="text-gray-400 hover:text-gray-700"
            onClick={e => { e.stopPropagation(); onChange(null) }}/>
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl
          p-3 min-w-[200px]">
          <p className="text-xs text-gray-400 mb-2 px-1">Оберіть час</p>
          <div className="grid grid-cols-4 gap-1.5">
            {HOURS.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => handleSelect(h)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  value && value.getHours() === h
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {String(h).padStart(2, '0')}:00
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}