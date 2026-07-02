'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
// Import both dictionaries statically — no async, no dynamic import
import { translations } from './translations'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Locale = 'vi' | 'en'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Returns a translated string. For array-valued keys, callers cast with `as unknown as string[]`. */
  t: (key: string) => string
}

// ─── Context ─────────────────────────────────────────────────────────────────

const LocaleContext = createContext<LocaleContextValue | null>(null)

// ─── Helper: nested key lookup ────────────────────────────────────────────────

// Translation values can be strings or string arrays (e.g. months, occasions).
// We use `unknown` + runtime access instead of a fully typed key path to keep
// the dictionary structure flexible without generating recursive mapped types.
function lookup(dict: object, key: string): unknown {
  const parts = key.split('.')
  let value: unknown = dict
  for (const part of parts) {
    if (value == null || typeof value !== 'object') return undefined
    value = (value as Record<string, unknown>)[part]
  }
  return value
}

// ─── Provider ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'flambe_locale'

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi')

  // On mount: restore saved preference from localStorage (one-time read).
  // Priority: localStorage (explicit choice) > browser language > 'vi' fallback.
  // Known limitation: the server always SSR-renders with the default locale ('vi'),
  // so users who had previously selected 'en' will see a brief flash of Vietnamese
  // text until this effect runs. Accepted trade-off vs. a server-side cookie approach.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved === 'en' || saved === 'vi') {
      setLocaleState(saved)
      return
    }
    // No explicit preference saved — detect from browser/system language.
    // navigator.languages[0] is the most preferred; fall back to navigator.language.
    const browserLang = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase()
    if (browserLang.startsWith('en')) {
      setLocaleState('en')
    }
    // Otherwise keep the 'vi' default already set in useState.
  }, [])

  // Update <html lang> whenever locale changes
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  // t() reads directly from the statically-imported object — fully synchronous.
  // Array-valued keys (months, weekdays, occasions) are returned as-is;
  // callers that need arrays cast with `as unknown as string[]`.
  const t = useCallback(
    (key: string): string => {
      const value = lookup(translations[locale], key)
      // String values returned directly. Array values (occasions, months, etc.)
      // are cast at call sites with `as unknown as string[]`.
      return (value as string | undefined) ?? key
    },
    [locale],
  )

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}
