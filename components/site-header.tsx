'use client'

import { Button } from '@/components/ui/button'
import { RESTAURANT } from '@/lib/restaurant'
import { UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            {RESTAURANT.name}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/admin">Nhân viên</Link>}
            nativeButton={false}
            variant="ghost"
            size="sm"
          />
          <Button
            render={<a href="#reserve">Đặt bàn</a>}
            nativeButton={false}
            size="sm"
          />
        </div>
      </div>
    </header>
  )
}
