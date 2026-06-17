'use client'

import { CalendarIcon, Clock, Users } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/restaurant'

interface SummaryBarProps {
  partySize: string
  date: Date | undefined
  time: string
}

function toISO(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function SummaryBar({ partySize, date, time }: SummaryBarProps) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 p-3 text-primary text-xs font-semibold shadow-inner">
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
