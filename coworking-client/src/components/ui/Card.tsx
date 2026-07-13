import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddings = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
}

export default function Card({
  children,
  className,
  onClick,
  hover = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-gray-100 dark:border-gray-800',
        'bg-white dark:bg-gray-900',
        paddings[padding],
        hover && 'transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Subcomponents ───────────────────────────────────────────

interface CardHeaderProps {
  children: ReactNode
  className?: string
  action?: ReactNode
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={cn(
      'flex items-start justify-between gap-4 mb-4',
      className
    )}>
      <div className="flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn(
      'text-sm font-medium text-gray-900 dark:text-white leading-snug',
      className
    )}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn(
      'text-sm text-gray-400 dark:text-gray-500 leading-relaxed', 
      className
    )}>
      {children}
    </p>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800',
      className
    )}>
      {children}
    </div>
  )
}