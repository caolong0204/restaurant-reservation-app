'use client'

import { CalendarIcon, Clock, Users } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/restaurant'

interface SummaryBarProps {
  partySize: string
  date: Date | undefined
  time: string
}

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function SummaryBar({ partySize, date, time }: SummaryBarProps) {
  return (
    <div className="mt-6 flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 p-3 text-primary text-xs font-semibold shadow-inner">
      <div className="flex items-center gap-1">
        <Users className="size-3.5" />
        <span>{partySize} khách</span>
      </div>
      <span className="opacity-40 text-primary/30">|</span>
      <div className="flex items-center gap-1">
        <CalendarIcon className="size-3.5" />
        <span>{date ? formatDate(toISO(date)) : 'Chưa chọn ngày'}</span>
      </div>
      <span className="opacity-40 text-primary/30">|</span>
      <div className="flex items-center gap-1">
        <Clock className="size-3.5" />
        <span>{time ? formatTime(time) : 'Chưa chọn giờ'}</span>
      </div>
    </div>
  )
}
