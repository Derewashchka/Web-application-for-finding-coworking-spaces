import { useEffect, useState } from 'react'
import { useFavoritesStore } from '../store/favoritesStore'
import api from '../api/axios'
import type { Coworking } from '../types'
import CoworkingCard from '../components/coworkings/CoworkingCard'
import Spinner from '../components/ui/Spinner'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function FavoritesPage() {
  const { ids } = useFavoritesStore()
  const [coworkings, setCoworkings] = useState<Coworking[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      if (ids.length === 0) {
        setCoworkings([])
        setLoading(false)
        return
      }
      try {
        // Завантажуємо кожен збережений коворкінг окремо за id
        const results = await Promise.all(
          ids.map(id => api.get(`/coworkings/${id}`).then(r => r.data))
        )
        setCoworkings(results.filter(Boolean))
      } catch {
        setCoworkings([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ids.join(',')])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-white dark:bg-gray-950">
      <div className="flex items-center gap-2 mb-6">
        <Heart size={18} className="text-red-400 fill-red-400"/>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Збережені</h1>
        <span className="text-sm text-gray-400 dark:text-gray-500">({ids.length})</span>
      </div>

      {loading ? <Spinner/> : coworkings.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <Heart size={32} className="mx-auto mb-3 opacity-20"/>
          <p className="text-sm text-gray-400 dark:text-gray-500">Немає збережених коворкінгів</p>
          <Link to="/catalog">
            <Button variant="outline" size="sm" className="mt-4">
              Переглянути каталог
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coworkings.map(cw => (
            <CoworkingCard key={cw.id} cw={cw}/>
          ))}
        </div>
      )}
    </main>
  )
}