'use client'

import { Button } from '@/components/ui/button'
import { RESTAURANT } from '@/lib/restaurant'
import Image from 'next/image'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link href="/" className="flex items-center gap-3" aria-label={RESTAURANT.name}>
          <Image
            src="/flambe-logo.png"
            alt={RESTAURANT.name}
            width={154}
            height={66}
            priority
            className="h-8 w-auto object-contain sm:h-9"
          />
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            render={
              <Link href="/admin" aria-label="Nhân viên">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-4 fill-current"
                >
                  <path d="M12 12c2.35 0 4.25-1.9 4.25-4.25S14.35 3.5 12 3.5 7.75 5.4 7.75 7.75 9.65 12 12 12Zm0 2c-3.76 0-6.75 2.05-6.75 4.62 0 .83.67 1.5 1.5 1.5h10.5c.83 0 1.5-.67 1.5-1.5C18.75 16.05 15.76 14 12 14Z" />
                </svg>
              </Link>
            }
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="inline-flex px-2.5 text-flambe-rust transition-colors hover:bg-flambe-rust/10 hover:text-flambe-rust"
          />
          <Button
            render={<a href="#reserve">Đặt bàn</a>}
            nativeButton={false}
            size="sm"
            className="rounded-md px-3 text-[11px] font-semibold uppercase tracking-wider shadow-md shadow-primary/20 transition-transform hover:scale-105 sm:px-6 sm:text-xs"
          />
        </div>
      </div>
    </header>
  )
}
