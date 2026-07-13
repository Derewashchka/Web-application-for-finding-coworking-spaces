import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useFavoritesStore } from '../../store/favoritesStore'
import { LogOut, User, ChevronDown } from 'lucide-react'
import Button from '../ui/Button'
import { useState, useRef, useEffect } from 'react'
import NotificationBell from './NotificationBell'
import ThemeToggle from '../ui/ThemeToggle'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore()
  const { ids } = useFavoritesStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Закрити дропдаун при кліку поза ним
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  const fullName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email?.split('@')[0]
    : ''

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link to="/" className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
          CoWork<span className="text-gray-400">UA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <Link to="/catalog" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Каталог
          </Link>
          
          {/* Посилання на збережені */}
          <Link to="/favorites" className="relative hover:text-gray-900 dark:hover:text-white transition-colors">
            Збережені
            {ids.length > 0 && (
              <span className="ml-1 text-xs text-red-400">({ids.length})</span>
            )}
          </Link>

          {/* Статистика для власника та адміна */}
          {(user?.role === 'owner') && (
            <Link to="/stats" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Статистика
            </Link>
          )}

          {/* Адмін-панель */}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Адмін
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          
          {/* Доданий дзвіночок сповіщень */}
          {isAuthenticated() && <NotificationBell/>}

          <ThemeToggle/>

          {isAuthenticated() ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                  text-sm text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center
                  justify-center text-white text-xs font-medium">
                  {(user?.firstName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
                </div>
                <span className="max-w-32 truncate">{fullName}</span>
                <ChevronDown size={13} className={`text-gray-400 transition-transform
                  ${open ? 'rotate-180' : ''}`}/>
              </button>
              
              {/* Дропдаун */}
              {open && (
                <div className="absolute right-0 top-10 w-52 bg-white dark:bg-gray-900
                  border border-gray-100 dark:border-gray-800
                  rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {fullName}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm
                      text-gray-700 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User size={14}/> Профіль
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm
                      text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={14}/> Вийти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Увійти</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Реєстрація</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}