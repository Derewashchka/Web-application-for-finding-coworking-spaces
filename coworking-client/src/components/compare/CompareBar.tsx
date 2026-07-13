import { useCompareStore } from '../../store/compareStore'
import { useNavigate } from 'react-router-dom'
import { X, GitCompareArrows } from 'lucide-react'
import Button from '../ui/Button'

export default function CompareBar() {
  const { ids, remove, clear } = useCompareStore()
  const navigate = useNavigate()

  if (ids.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50
      animate-in slide-in-from-bottom-2
      flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl
      border border-gray-200 dark:border-gray-700
      bg-white dark:bg-gray-900
      backdrop-blur-sm">

      {/* Іконка + підпис */}
      <div className="flex items-center gap-2 shrink-0">
        <GitCompareArrows size={15}
          className="text-gray-500 dark:text-gray-400"/>
        <span className="text-sm font-medium
          text-gray-900 dark:text-white">
          Порівняння
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          ({ids.length}/3)
        </span>
      </div>

      {/* Слоти */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-8 h-8 rounded-lg border text-xs font-medium
              flex items-center justify-center transition-colors ${
              ids[i]
                ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                : 'border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
            }`}
          >
            {ids[i] ? (
              <button
                onClick={() => remove(ids[i])}
                className="w-full h-full flex items-center justify-center
                  hover:text-red-500 transition-colors rounded-lg"
              >
                <X size={12}/>
              </button>
            ) : (
              <span>+</span>
            )}
          </div>
        ))}
      </div>

      {/* Дії */}
      <div className="flex items-center gap-2 pl-1
        border-l border-gray-100 dark:border-gray-700">
        <button
          onClick={clear}
          className="text-xs text-gray-400 dark:text-gray-500
            hover:text-gray-700 dark:hover:text-gray-300
            transition-colors px-1"
        >
          Очистити
        </button>
        <Button
          size="sm"
          disabled={ids.length < 2}
          onClick={() => navigate('/compare')}
        >
          Порівняти →
        </Button>
      </div>
    </div>
  )
}