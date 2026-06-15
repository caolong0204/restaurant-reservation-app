'use client'

import Link from 'next/link'
import { UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RESTAURANT } from '@/lib/restaurant'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            {RESTAURANT.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#experience"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Experience
          </a>
          <a
            href="#menu"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Menu
          </a>
          <a
            href="#visit"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Visit
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/admin">Staff</Link>}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          />
          <Button
            render={<a href="#reserve">Reserve</a>}
            nativeButton={false}
            size="sm"
          />
        </div>
      </div>
    </header>
  )
}
