import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Shield, Star, Trophy } from 'lucide-react'
import Button from '../components/ui/Button'
import CoworkingCard from '../components/coworkings/CoworkingCard'
import Spinner from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'
import { getTopCoworkings } from '../api/coworkings'
import type { Coworking } from '../types'

const features = [
  { icon: Search,  title: 'Зручний пошук',     desc: 'Фільтруйте за містом, ціною, зручностями та рейтингом' },
  { icon: MapPin,  title: 'Інтерактивна карта',  desc: 'Переглядайте коворкінги на карті міста з геопозицією' },
  { icon: Star,    title: 'Відгуки клієнтів',    desc: 'Чесні відгуки та рейтинги від реальних відвідувачів' },
  { icon: Shield,  title: 'Безпечне бронювання', desc: 'Захищена оплата та гарантія підтвердженого місця' },
]

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const [top, setTop]         = useState<Coworking[]>([])
  const [loadingTop, setLoadingTop] = useState(true)

  useEffect(() => {
    getTopCoworkings()
      .then(r => setTop(r.data))
      .finally(() => setLoadingTop(false))
  }, [])

  return (
    <main>
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <span className="inline-block text-xs font-medium text-gray-500 dark:text-gray-400
          border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 mb-6">
          Платформа пошуку коворкінгів в Україні
        </span>
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white
          leading-tight tracking-tight mb-4">
          Знайди ідеальне місце<br/>для роботи
        </h1>
        <p className="text-gray-400 dark:text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Понад 100 коворкінгів у містах України. Бронюй погодинно,
          порівнюй ціни та читай відгуки.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/catalog">
            <Button size="lg">Переглянути каталог</Button>
          </Link>
          {!isAuthenticated() && (
            <Link to="/register">
              <Button size="lg" variant="outline">Зареєструватись</Button>
            </Link>
          )}
        </div>
      </section>

      {/* ── Топ-3 тижня ── */}
      <section className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-amber-400"/>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Топ-3 коворкінги тижня
            </h2>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            Найбільше позитивних відгуків за останні 7 днів
          </p>

          {loadingTop ? (
            <Spinner/>
          ) : top.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Поки що недостатньо даних для рейтингу
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {top.map((cw, i) => (
                <div key={cw.id} className="relative">
                  {/* Медаль */}
                  <div className={`absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full
                    flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white dark:border-gray-900
                    ${i === 0 ? 'bg-amber-400 text-white'
                    : i === 1 ? 'bg-gray-300 text-gray-700'
                    :           'bg-amber-700 text-white'}`}>
                    {i + 1}
                  </div>
                  <CoworkingCard cw={cw}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-16
          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800
                flex items-center justify-center">
                <Icon size={16} className="text-gray-700 dark:text-gray-300"/>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}