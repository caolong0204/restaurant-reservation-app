'use client'

import { RESTAURANT } from '@/lib/restaurant'
import { useLocale } from '@/lib/i18n/locale-context'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface FooterProps {
  /** Pre-computed bilingual hour labels from the server. Falls back to locale-context defaults if omitted. */
  hourLabels?: { vi: string[]; en: string[] }
}

export function Footer({ hourLabels }: FooterProps) {
  const { t, locale } = useLocale()

  // Pick the correct locale's labels; fall back to the translation dictionary defaults
  const hours: string[] = hourLabels
    ? hourLabels[locale]
    : (t('info.hoursValue') as unknown as string[])

  return (
    <footer className="border-t border-border bg-secondary/15">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 sm:pt-10 sm:pb-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.25fr_1.35fr_1.9fr_1.15fr]">
          <div>
            <Link href="/" className="inline-block mb-3" aria-label={RESTAURANT.name}>
              <Image
                src="/flambe-logo.png"
                alt={RESTAURANT.name}
                width={154}
                height={66}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="max-w-xs text-sm font-medium italic text-flambe-rust">
              {t('hero.tagline')}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-flambe-rust">
              <MapPin className="size-3.5" />
              {t('footer.address')}
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
              {RESTAURANT.address}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-flambe-rust">
              <Clock className="size-3.5" />
              {t('footer.hours')}
            </p>
            <div className="mt-2 space-y-1 text-sm font-medium leading-relaxed text-foreground">
              {hours.map((h) => (
                <p key={h} className="lg:whitespace-nowrap">{h}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-flambe-rust">
              <Phone className="size-3.5" />
              {t('footer.contact')}
            </p>
            <div className="mt-2 space-y-1 text-sm font-medium leading-relaxed text-foreground">
              <a href={`tel:${RESTAURANT.phoneRaw}`} className="block transition-colors hover:text-flambe-rust">
                {RESTAURANT.phone}
              </a>
              <a href={`mailto:${RESTAURANT.email}`} className="flex items-center gap-2 transition-colors hover:text-flambe-rust">
                <Mail className="size-3.5 text-flambe-rust" />
                {RESTAURANT.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
