'use client'

import { RESTAURANT } from '@/lib/restaurant'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-3 py-8 text-sm text-muted-foreground sm:flex-row sm:px-4">
        <p className="font-serif text-base font-semibold text-foreground">
          {RESTAURANT.name}
        </p>
        <p>{RESTAURANT.address}</p>
        <p>
          &copy; {new Date().getFullYear()} {RESTAURANT.name}. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  )
}
