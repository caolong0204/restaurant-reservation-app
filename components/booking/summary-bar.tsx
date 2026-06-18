'use client'

import { CalendarIcon, Clock, User } from 'lucide-react'

interface SummaryBarProps {
  partySize: string
  date: Date | undefined
  time: string
}

function formatShortDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function SummaryBar({ partySize, date, time }: SummaryBarProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between rounded-xl bg-flambe-summary-bg p-3 px-4 sm:px-5">
      <div className="flex items-center gap-2">
        <User className="size-5 text-flambe-rust stroke-[1.5]" />
        <span className="text-[14px] font-medium text-flambe-text-dark">
          SỐ KHÁCH: {partySize}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CalendarIcon className="size-5 text-flambe-rust stroke-[1.5]" />
        <span className="text-[14px] font-medium text-flambe-text-dark">
          NGÀY: {date ? formatShortDate(date) : '--/--/----'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="size-5 text-flambe-rust stroke-[1.5]" />
        <span className="text-[14px] font-medium text-flambe-text-dark">
          GIỜ: {time || '--:--'}
        </span>
      </div>
    </div>
  )
}
