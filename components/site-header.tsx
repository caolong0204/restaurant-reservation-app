'use client'

import { Button } from '@/components/ui/button'
import { RESTAURANT } from '@/lib/restaurant'
import Image from 'next/image'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3" aria-label={RESTAURANT.name}>
          <Image
            src="/flambe-logo.png"
            alt={RESTAURANT.name}
            width={154}
            height={66}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/admin">Nhân viên</Link>}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex text-flambe-rust hover:text-flambe-rust hover:bg-flambe-rust/10 font-medium uppercase tracking-wider text-xs transition-colors"
          />
          <Button
            render={<a href="#reserve">Đặt bàn</a>}
            nativeButton={false}
            size="sm"
            className="shadow-md shadow-primary/20 font-semibold uppercase tracking-wider text-xs rounded-md px-6 transition-transform hover:scale-105"
          />
        </div>
      </div>
    </header>
  )
}
