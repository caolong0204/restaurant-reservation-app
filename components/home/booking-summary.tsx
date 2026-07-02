'use client'

import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Layers,
  Phone,
  User,
  Users,
} from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { translateOccasion } from '@/lib/i18n/locale-utils'
import { OCCASIONS, TABLE_LOCATIONS, formatDateLong } from '@/lib/restaurant'

interface BookingSummaryProps {
  date: Date | undefined
  partySize: string
  time: string
  name: string
  phone: string
  occasion: string
  tableLocation: string
  notes: string
}

function toISO(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function BookingSummary({
  date,
  partySize,
  time,
  name,
  phone,
  occasion,
  tableLocation,
  notes,
}: BookingSummaryProps) {
  const { t } = useLocale()
  const occasionLabels = t('occasions') as unknown as string[]
  const occasionDisplay = occasion ? translateOccasion(occasion, occasionLabels) : occasion

  return (
    <div className="scroll-mt-20 lg:col-span-5 hidden lg:flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          {t('bookingSummary.eyebrow')}
        </p>
        <h2 className="mt-3 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          {t('bookingSummary.title')}
        </h2>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
          {t('bookingSummary.subtitle')}
        </p>
      </div>

      {/* Ticket Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-md relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        <div className="flex flex-col gap-5">
          <h4 className="font-serif text-lg font-bold text-foreground border-b border-border/60 pb-3">
            {t('bookingSummary.ticketTitle')}
          </h4>

          {/* Selections */}
          <div className="flex flex-col gap-3.5">
            {/* Party size */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Users className="size-4 text-primary" />
                {t('bookingSummary.partySize')}
              </span>
              <span className="font-semibold text-foreground">
                {partySize ? `${partySize} ${t('bookingSummary.guestSuffix')}` : t('bookingSummary.noParty')}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Calendar className="size-4 text-primary" />
                {t('bookingSummary.date')}
              </span>
              <span className="font-semibold text-foreground text-right max-w-[180px] truncate">
                {date ? formatDateLong(toISO(date)) : t('bookingSummary.noDate')}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Clock className="size-4 text-primary" />
                {t('bookingSummary.time')}
              </span>
              <span className="font-semibold text-foreground">
                {time ? time : t('bookingSummary.noTime')}
              </span>
            </div>
          </div>

          {/* Guest Details (only if step >= 4 or filled in) */}
          {(name.trim() || phone.trim() || notes.trim()) && (
            <div className="border-t border-dashed border-border/80 pt-4 flex flex-col gap-3.5">
              <h5 className="font-serif text-sm font-bold text-foreground opacity-90">
                {t('bookingSummary.contactTitle')}
              </h5>

              <div className="flex flex-col gap-2.5">
                {/* Name */}
                {name.trim() && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="size-3.5" />
                      {t('bookingSummary.name')}
                    </span>
                    <span className="font-medium text-foreground">{name}</span>
                  </div>
                )}

                {/* Phone */}
                {phone.trim() && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="size-3.5" />
                      {t('bookingSummary.phone')}
                    </span>
                    <span className="font-medium text-foreground">{phone}</span>
                  </div>
                )}

                {/* Occasion */}
                {occasion !== OCCASIONS[0] && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle className="size-3.5" />
                      {t('bookingSummary.occasion')}
                    </span>
                    <span className="font-medium text-foreground">{occasionDisplay}</span>
                  </div>
                )}

                {/* Table Location */}
                {tableLocation && tableLocation !== TABLE_LOCATIONS[0] && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Layers className="size-3.5" />
                      {t('bookingSummary.tableLocation')}
                    </span>
                    <span className="font-medium text-foreground">{tableLocation}</span>
                  </div>
                )}

                {/* Special requests */}
                {notes.trim() && (
                  <div className="flex flex-col gap-1.5 text-xs mt-1 bg-secondary/35 rounded-lg p-2.5 border border-border/40">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                      <FileText className="size-3.5" />
                      {t('bookingSummary.notes')}
                    </span>
                    <p className="italic text-muted-foreground/90 leading-relaxed font-serif text-[13px]">
                      &ldquo;{notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
