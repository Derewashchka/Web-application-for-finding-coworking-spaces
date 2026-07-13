import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-800',
          'px-3 py-2 text-sm text-gray-900 dark:text-gray-100',
          'outline-none focus:border-gray-400 dark:focus:border-gray-500',
          'focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-800',
          'placeholder:text-gray-400 dark:placeholder:text-gray-600',
          'transition-colors',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)

Input.displayName = 'Input'
export default Input