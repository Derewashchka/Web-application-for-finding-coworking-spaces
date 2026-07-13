import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { CoworkingFilter } from '../../types'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface Props {
  onFilter: (filter: CoworkingFilter) => void
}

export default function CoworkingFilters({ onFilter }: Props) {
  const [open,      setOpen]      = useState(false)
  const [city,      setCity]      = useState('')
  const [minPrice,  setMinPrice]  = useState('')
  const [maxPrice,  setMaxPrice]  = useState('')
  const [minRating, setMinRating] = useState('')
  const [amenity,   setAmenity]   = useState('')

  const apply = () => {
    onFilter({
      city:      city      || undefined,
      minPrice:  minPrice  ? Number(minPrice)  : undefined,
      maxPrice:  maxPrice  ? Number(maxPrice)  : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      amenity:   amenity   || undefined,
    })
  }

  const reset = () => {
    setCity(''); setMinPrice(''); setMaxPrice('')
    setMinRating(''); setAmenity('')
    onFilter({})
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Рядок пошуку */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2
            -translate-y-1/2 text-gray-400"/>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && apply()}
            placeholder="Місто або назва..."
            className="w-full pl-9 pr-4 py-2 text-sm
              border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              rounded-lg focus:outline-none focus:border-gray-400
              dark:focus:border-gray-500
              placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
        </div>
        <Button variant="outline" size="md" onClick={() => setOpen(!open)}>
          <SlidersHorizontal size={14}/>
          Фільтри
        </Button>
        <Button size="md" onClick={apply}>Знайти</Button>
      </div>

      {/* Розширені фільтри */}
      {open && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4
          border border-gray-100 dark:border-gray-700
          rounded-xl bg-gray-50 dark:bg-gray-800/50">

          <Input
            label="Ціна від (₴/год)"
            type="number"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="50"
          />
          <Input
            label="Ціна до (₴/год)"
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="500"
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium
              text-gray-700 dark:text-gray-300">
              Мін. рейтинг
            </label>
            <select
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700
                px-3 py-2 text-sm focus:outline-none focus:border-gray-400
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100"
            >
              <option value="">Будь-який</option>
              {[3, 3.5, 4, 4.5].map(r => (
                <option key={r} value={r}>від {r} ★</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium
              text-gray-700 dark:text-gray-300">
              Зручності
            </label>
            <select
              value={amenity}
              onChange={e => setAmenity(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700
                px-3 py-2 text-sm focus:outline-none focus:border-gray-400
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100"
            >
              <option value="">Всі</option>
              {['WiFi','Кухня','Кава','Принтер','Паркінг','Переговорна'].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 md:col-span-4 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>
              <X size={14}/> Скинути
            </Button>
            <Button size="sm" onClick={apply}>Застосувати</Button>
          </div>
        </div>
      )}
    </div>
  )
}