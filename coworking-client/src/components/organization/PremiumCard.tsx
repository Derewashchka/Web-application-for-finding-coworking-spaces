import { useState } from 'react'
import { upgradeToPremium } from '../../api/organizations'
import Button from '../ui/Button'
import { Crown, Check, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

interface Props {
  isPremium:     boolean
  premiumUntil?: string | null
  onUpgraded:    () => void
}

export default function PremiumCard({ isPremium, premiumUntil, onUpgraded }: Props) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!confirm('Активувати преміум план на 1 місяць?')) return
    setLoading(true)
    try {
      await upgradeToPremium()
      toast.success('🎉 Преміум активовано!')
      onUpgraded()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Помилка активації')
    } finally {
      setLoading(false)
    }
  }

  const basicFeatures = [
    'До 2 коворкінгів',
    'Загальна кількість переглядів',
    'Базова статистика',
  ]

  const premiumFeatures = [
    'Необмежена кількість коворкінгів',
    'Детальна аналітика (доходи, графіки)',
    'Завантаженість по днях і годинах',
    'Пріоритетна модерація',
    'Значок Premium на сторінці',
  ]

  return (
    <div className={`rounded-xl border overflow-hidden ${
      isPremium
        ? 'border-amber-300 dark:border-amber-600'
        : 'border-gray-200 dark:border-gray-700'
    }`}>

      {/* Cap */}
      <div className={`flex items-center justify-between px-4 py-3 ${
        isPremium
          ? 'bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700'
          : 'bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700'
      }`}>
        <div className="flex items-center gap-2">
          <Crown size={16} className={isPremium ? 'text-amber-500' : 'text-gray-400'}/>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {isPremium ? 'Premium план' : 'Базовий план'}
          </span>
        </div>
        {isPremium && premiumUntil && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            до {format(new Date(premiumUntil), 'dd MMM yyyy', { locale: uk })}
          </span>
        )}
      </div>

      {/* Plan cards */}
      <div className="p-4 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Basic */}
        <div className={`p-4 rounded-xl border ${
          !isPremium
            ? 'border-gray-900 dark:border-gray-500 bg-gray-50 dark:bg-gray-800'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
        }`}>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Базовий — Безкоштовно
          </p>
          <ul className="flex flex-col gap-2">
            {basicFeatures.map(f => (
              <li key={f} className="flex items-center gap-2">
                <Check size={12} className="text-gray-400 dark:text-gray-500 shrink-0"/>
                <span className="text-xs text-gray-600 dark:text-gray-400">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Premium */}
        <div className={`p-4 rounded-xl border ${
          isPremium
            ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20'
            : 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
        }`}>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3">
            Premium — 499 ₴/міс
          </p>
          <ul className="flex flex-col gap-2">
            {premiumFeatures.map(f => (
              <li key={f} className="flex items-center gap-2">
                <Zap size={12} className="text-amber-500 dark:text-amber-400 shrink-0"/>
                <span className="text-xs text-gray-700 dark:text-gray-300">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upgrade button */}
      {!isPremium && (
        <div className="px-4 pb-4 bg-white dark:bg-gray-900">
          <Button
            className="w-full"
            loading={loading}
            onClick={handleUpgrade}
          >
            <Crown size={14}/> Перейти на Premium — 499 ₴/міс
          </Button>
        </div>
      )}
    </div>
  )
}