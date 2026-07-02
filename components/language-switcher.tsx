'use client'

import { useLocale } from '@/lib/i18n/locale-context'
import type { Locale } from '@/lib/i18n/locale-context'
import { cn } from '@/lib/utils'

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'vi', label: 'VI' },
  { value: 'en', label: 'EN' },
]

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={cn(
        'flex items-center rounded-full border border-border bg-secondary/50 p-0.5 text-xs font-semibold',
        className,
      )}
    >
      {LOCALES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
          className={cn(
            'rounded-full px-2.5 py-0.5 transition-all duration-200',
            locale === value
              ? 'bg-flambe-rust text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
