import { useEffect, useState } from 'react'
import { useCompareStore } from '../store/compareStore'
import { getCoworkingById } from '../api/coworkings'
import type { Coworking } from '../types'
import Spinner from '../components/ui/Spinner'
import { Link, useNavigate } from 'react-router-dom'
import { Star, MapPin, Users, X, Check, Minus } from 'lucide-react'
import Button from '../components/ui/Button'

const ALL_AMENITIES = [
  'WiFi','Кухня','Кава','Принтер','Паркінг','Переговорна','Лаундж'
]

export default function ComparePage() {
  const { ids, remove, clear } = useCompareStore()
  const navigate = useNavigate()
  const [coworkings, setCoworkings] = useState<Coworking[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return }
    Promise.all(ids.map(id => getCoworkingById(id)))
      .then(responses => setCoworkings(responses.map(r => r.data)))
      .finally(() => setLoading(false))
  }, [])

  if (ids.length < 2 && !loading) return (
    <main className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400 dark:text-gray-500 mb-4">
        Оберіть мінімум 2 коворкінги для порівняння
      </p>
      <Button onClick={() => navigate('/catalog')}>
        До каталогу
      </Button>
    </main>
  )

  if (loading) return <Spinner/>

  const hasAmenity = (cw: Coworking, a: string) =>
    cw.amenities?.split(',').map(s => s.trim()).includes(a) ?? false

  // Finding the best values ​​for backlighting
  const minPrice  = Math.min(...coworkings.map(c => c.pricePerHour))
  const maxRating = Math.max(...coworkings.map(c => c.rating))
  const maxSeats  = Math.max(...coworkings.map(c => c.totalSeats))

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Порівняння коворкінгів
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {coworkings.length} простори
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { clear(); navigate('/catalog') }}>
          <X size={13}/> Очистити
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <td className="w-36 pb-4"/>

              {coworkings.map(cw => (
                <td key={cw.id} className="pb-4 px-3 align-top">
                  <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="h-32 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
                      <img
                        src={cw.photoUrl}
                        alt={cw.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          remove(cw.id)
                          setCoworkings(prev => prev.filter(c => c.id !== cw.id))
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/90 dark:bg-gray-900/90
                          rounded-full flex items-center justify-center
                          text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <X size={12}/>
                      </button>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-950">
                      <Link
                        to={`/coworkings/${cw.id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white
                          hover:underline line-clamp-1"
                      >
                        {cw.name}
                      </Link>
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center
                        gap-1 mt-0.5">
                        <MapPin size={10}/>{cw.city}
                      </p>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ── Price ── */}
            <CompareRow label="Ціна / год">
              {coworkings.map(cw => (
                <td key={cw.id} className={`px-3 py-3 text-center text-sm
                  font-semibold border-t border-gray-50 dark:border-gray-800 ${
                  cw.pricePerHour === minPrice
                    ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {cw.pricePerHour} ₴
                  {cw.pricePerHour === minPrice && (
                    <span className="block text-[10px] font-normal
                      text-green-500 dark:text-green-400">найдешевший</span>
                  )}
                </td>
              ))}
            </CompareRow>

            {/* ── Rating ── */}
            <CompareRow label="Рейтинг">
              {coworkings.map(cw => (
                <td key={cw.id} className="px-3 py-3 text-center
                  border-t border-gray-50 dark:border-gray-800">
                  <div className={`inline-flex items-center gap-1 text-sm
                    font-medium ${
                    cw.rating === maxRating
                      ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    <Star size={12} className={
                      cw.rating === maxRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700'
                    }/>
                    {cw.rating > 0 ? cw.rating.toFixed(1) : 'Новий'}
                  </div>
                  {cw.rating === maxRating && cw.rating > 0 && (
                    <div className="text-[10px] text-amber-500 dark:text-amber-400 mt-0.5">
                      найвищий
                    </div>
                  )}
                </td>
              ))}
            </CompareRow>

            {/* ── Capacity ── */}
            <CompareRow label="Місця">
              {coworkings.map(cw => (
                <td key={cw.id} className={`px-3 py-3 text-center text-sm
                  border-t border-gray-50 dark:border-gray-800 ${
                  cw.totalSeats === maxSeats
                    ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  <div className="flex items-center justify-center gap-1">
                    <Users size={12}/>
                    {cw.totalSeats}
                  </div>
                </td>
              ))}
            </CompareRow>

            {/* ── Amenities ── */}
            <CompareRow label="Зручності" header/>
            {ALL_AMENITIES.map(amenity => (
              <CompareRow key={amenity} label={amenity} indent>
                {coworkings.map(cw => (
                  <td key={cw.id}
                    className="px-3 py-2.5 text-center border-t border-gray-50 dark:border-gray-800">
                    {hasAmenity(cw, amenity) ? (
                      <Check size={15} className="mx-auto text-green-500 dark:text-green-400"/>
                    ) : (
                      <Minus size={15} className="mx-auto text-gray-200 dark:text-gray-700"/>
                    )}
                  </td>
                ))}
              </CompareRow>
            ))}

            {/* ── Buttons ── */}
            <tr>
              <td className="pt-4"/>
              {coworkings.map(cw => (
                <td key={cw.id} className="px-3 pt-4">
                  <Link to={`/coworkings/${cw.id}`}>
                    <Button size="sm" variant="outline" className="w-full">
                      Переглянути
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  )
}

// ── Auxiliary line component ────────────────────────────────

function CompareRow({
  label, children, header = false, indent = false
}: {
  label:     string
  children?: React.ReactNode
  header?:   boolean
  indent?:   boolean
}) {
  return (
    <tr className={header ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
      <td className={`py-3 pr-3 text-xs border-t border-gray-50 dark:border-gray-800
        whitespace-nowrap ${
        header ? 'font-semibold text-gray-700 dark:text-gray-300 px-3' :
        indent ? 'pl-5 text-gray-500 dark:text-gray-500' :
                 'font-medium text-gray-700 dark:text-gray-300'
      }`}>
        {label}
      </td>
      {children}
    </tr>
  )
}