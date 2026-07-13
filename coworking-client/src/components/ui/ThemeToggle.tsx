import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeStore()

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Світла тема' : 'Темна тема'}
      className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-800
        transition-colors"
    >
      {isDark
        ? <Sun  size={18} className="text-amber-400"/>
        : <Moon size={18} className="text-gray-500"/>
      }
    </button>
  )
}