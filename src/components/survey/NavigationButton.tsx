'use client'

import { ArrowRight, Loader2 } from 'lucide-react'

interface NavigationButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary'
}

export function NavigationButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
}: NavigationButtonProps) {
  const baseClasses =
    'group flex w-full items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50'

  const variantClasses =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>처리 중...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  )
}
