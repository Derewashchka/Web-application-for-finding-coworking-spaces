import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'green' | 'yellow' | 'red' | 'gray' | 'blue'

const styles: Record<Variant, string> = {
  green:  'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  red:    'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  gray:   'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  blue:   'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
}

interface BadgeProps {
  children: ReactNode
  variant?: Variant
  className?: string
}

export default function Badge({
  children,
  variant = 'gray',
  className,
}: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md',
      'text-xs font-medium border',
      styles[variant],
      className
    )}>
      {children}
    </span>
  )
}