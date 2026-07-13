import { useState, useEffect, useRef, useCallback } from 'react'
import { getCoworkings } from '../api/coworkings'
import type { Coworking, CoworkingFilter } from '../types'
import CoworkingCard from '../components/coworkings/CoworkingCard'
import CoworkingFilters from '../components/coworkings/CoworkingFilters'
import CoworkingMap from '../components/coworkings/CoworkingMap'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { Map, List, ArrowUpDown } from 'lucide-react'

type SortKey =
  'default' | 'rating_desc' | 'rating_asc' |
  'price_asc' | 'price_desc' | 'seats_desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default',     label: 'За замовчуванням' },
  { value: 'rating_desc', label: 'Рейтинг: від вищого' },
  { value: 'rating_asc',  label: 'Рейтинг: від нижчого' },
  { value: 'price_asc',   label: 'Ціна: від дешевших' },
  { value: 'price_desc',  label: 'Ціна: від дорожчих' },
  { value: 'seats_desc',  label: 'Найбільше місць' },
]

function sortCoworkings(list: Coworking[], sort: SortKey): Coworking[] {
  const arr = [...list]
  switch (sort) {
    case 'rating_desc': return arr.sort((a, b) => b.rating - a.rating)
    case 'rating_asc':  return arr.sort((a, b) => a.rating - b.rating)
    case 'price_asc':   return arr.sort((a, b) => a.pricePerHour - b.pricePerHour)
    case 'price_desc':  return arr.sort((a, b) => b.pricePerHour - a.pricePerHour)
    case 'seats_desc':  return arr.sort((a, b) => b.totalSeats - a.totalSeats)
    default:            return arr
  }
}

const PAGE_SIZE = 9

export default function CatalogPage() {
  const [coworkings,  setCoworkings]  = useState<Coworking[]>([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showMap,     setShowMap]     = useState(false)
  const [sort,        setSort]        = useState<SortKey>('default')
  const [filter,      setFilter]      = useState<CoworkingFilter>({})
  const [page,        setPage]        = useState(1)
  const [hasNext,     setHasNext]     = useState(false)
  const [totalCount,  setTotalCount]  = useState(0)
  const loaderRef = useRef<HTMLDivElement>(null)

  const fetchPage = useCallback(async (
    f: CoworkingFilter,
    p: number,
    append = false
  ) => {
    append ? setLoadingMore(true) : setLoading(true)
    try {
      const { data } = await getCoworkings(f, p, PAGE_SIZE)
      const items: Coworking[] = data.items ?? data
      setCoworkings(prev => append ? [...prev, ...items] : items)
      setHasNext(data.hasNext ?? false)
      setTotalCount(data.totalCount ?? items.length)
    } catch {
      if (!append) setCoworkings([])
    } finally {
      append ? setLoadingMore(false) : setLoading(false)
    }
  }, [])

  // При зміні фільтрів — скидаємо і завантажуємо з початку
  useEffect(() => {
    setPage(1)
    fetchPage(filter, 1, false)
  }, [filter])

  // IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loadingMore) {
          const next = page + 1
          setPage(next)
          fetchPage(filter, next, true)
        }
      },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasNext, loadingMore, page, filter])

  const sorted = sortCoworkings(coworkings, sort)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Шапка ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Каталог коворкінгів
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {totalCount} просторів знайдено
          </p>
        </div>
        <Button variant="outline" size="sm"
          onClick={() => setShowMap(!showMap)}>
          {showMap
            ? <><List size={14}/> Список</>
            : <><Map  size={14}/> Карта</>}
        </Button>
      </div>

      {/* ── Фільтри + сортування ── */}
      <div className="flex flex-col gap-3 mb-6">
        <CoworkingFilters onFilter={f => setFilter(f)}/>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-gray-400 shrink-0"/>
          <span className="text-xs text-gray-400 shrink-0">Сортування:</span>
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setSort(o.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium
                  border transition-colors ${
                  sort === o.value
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Карта ── */}
      {showMap && (
        <div className="mb-6">
          <CoworkingMap coworkings={sorted}/>
        </div>
      )}

      {/* ── Список ── */}
      {loading ? <Spinner/> : sorted.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Нічого не знайдено</p>
          <p className="text-sm mt-1">Спробуйте змінити параметри пошуку</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(cw => (
              <CoworkingCard key={cw.id} cw={cw}/>
            ))}
          </div>

          {/* ── Тригер нескінченного скролу ── */}
          <div ref={loaderRef} className="flex justify-center mt-10 h-10">
            {loadingMore && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-200
                  border-t-gray-600 rounded-full animate-spin"/>
                Завантаження...
              </div>
            )}
            {!hasNext && !loadingMore && coworkings.length > 0 && (
              <p className="text-xs text-gray-300 dark:text-gray-600">
                Всі {totalCount} просторів завантажено
              </p>
            )}
          </div>
        </>
      )}
    </main>
  )
}