import { Link } from 'react-router-dom'
import { MapPin, Star, Users, Heart, GitCompareArrows } from 'lucide-react'
import type { Coworking } from '../../types'
import Badge from '../ui/Badge'
import { useFavoritesStore } from '../../store/favoritesStore'
import { useCompareStore } from '../../store/compareStore'
import toast from 'react-hot-toast'

export default function CoworkingCard({ cw }: { cw: Coworking }) {
  const { toggle, isFavorite } = useFavoritesStore()
  const fav = isFavorite(cw.id)

  const { add, remove, isInCompare } = useCompareStore()
  const inCompare = isInCompare(cw.id)

  const amenities = cw.amenities?.split(',').slice(0, 3) ?? []

  return (
    <Link to={`/coworkings/${cw.id}`}
      className="group flex flex-col rounded-xl border border-gray-100
        dark:border-gray-800 bg-white dark:bg-gray-900
        hover:border-gray-300 dark:hover:border-gray-600
        hover:shadow-sm transition-all duration-200 overflow-hidden">

      {/* Photo */}
      <div className="relative h-44 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <img
          src={cw.photoUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'}
          alt={cw.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Heart button */}
        <div className="absolute top-2 left-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              toggle(cw.id)
            }}
            className="w-7 h-7 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
              flex items-center justify-center transition-colors
              hover:bg-white dark:hover:bg-gray-800"
          >
            <Heart
              size={14}
              className={fav
                ? 'text-red-500 fill-red-500'
                : 'text-gray-400 dark:text-gray-500'}
            />
          </button>
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
          rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-medium text-gray-900 dark:text-white">
          <Star size={12} className="text-amber-400 fill-amber-400"/>
          {cw.rating > 0 ? cw.rating.toFixed(1) : 'Новий'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
            {cw.name}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={11}/> {cw.city}, {cw.address}
          </p>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {amenities.map(a => (
            <Badge key={a} variant="gray">{a.trim()}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2
          border-t border-gray-50 dark:border-gray-800">
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Users size={11}/> {cw.totalSeats} місць
            </span>
            
            {/* Compare button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                if (inCompare) {
                  remove(cw.id)
                } else {
                  const ok = add(cw.id)
                  if (!ok) toast.error('Можна порівнювати максимум 3 коворкінги')
                }
              }}
              className={`flex items-center gap-1 text-xs transition-colors ${
                inCompare
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <GitCompareArrows size={12}/>
              {inCompare ? 'Порівнюється' : 'Порівняти'}
            </button>
          </div>

          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {cw.pricePerHour} ₴
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500">/год</span>
          </span>
        </div>
      </div>
    </Link>
  )
}