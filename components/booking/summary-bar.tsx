'use client'

import { CalendarIcon, Clock, User } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { formatShortDate } from '@/lib/utils'

interface SummaryBarProps {
  partySize: string
  date: Date | undefined
  time: string
}

export function SummaryBar({ partySize, date, time }: SummaryBarProps) {
  const { t } = useLocale()

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between rounded-xl bg-flambe-summary-bg p-3 px-4 sm:px-5">
      <div className="flex items-center gap-2">
        <User className="size-5 text-flambe-rust stroke-[1.5]" />
        <span className="text-[14px] font-medium text-flambe-text-dark">
          {t('summaryBar.guests')} {partySize}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CalendarIcon className="size-5 text-flambe-rust stroke-[1.5]" />
        <span className="text-[14px] font-medium text-flambe-text-dark">
          {t('summaryBar.date')} {date ? formatShortDate(date) : '--/--/----'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="size-5 text-flambe-rust stroke-[1.5]" />
        <span className="text-[14px] font-medium text-flambe-text-dark">
          {t('summaryBar.time')} {time || '--:--'}
        </span>
      </div>
    </div>
  )
}
