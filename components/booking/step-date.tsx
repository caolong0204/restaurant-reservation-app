'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

interface StepDateProps {
  date: Date | undefined
  setDate: (d: Date | undefined) => void
  today: Date
  currentMonth: Date
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>
}

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function StepDate({
  date,
  setDate,
  today,
  currentMonth,
  setCurrentMonth,
}: StepDateProps) {
  // Month navigation helpers
  const prevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const calendarMonthLabel = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const monthsVi = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ]
    return `${monthsVi[month]} ${year}`
  }

  const renderCalendarCells = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Adjust starting day of week for Monday-start (0 = Mon, 6 = Sun)
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7

    const cells = []

    // Empty cells at start of month
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="size-7 sm:size-8" />)
    }

    // Days cells
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const cellDate = new Date(year, month, dayNum)
      const isPast = cellDate < today

      const isToday =
        cellDate.getDate() === today.getDate() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getFullYear() === today.getFullYear()

      const isSelected =
        date &&
        cellDate.getDate() === date.getDate() &&
        cellDate.getMonth() === date.getMonth() &&
        cellDate.getFullYear() === date.getFullYear()

      cells.push(
        <button
          key={`day-${dayNum}`}
          type="button"
          disabled={isPast}
          onClick={() => {
            setDate(cellDate)
          }}
          className={cn(
            'size-7 sm:size-8 mx-auto flex items-center justify-center text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200',
            isPast && 'text-muted-foreground/30 cursor-not-allowed',
            !isPast &&
              !isSelected &&
              'hover:bg-flambe-rust/10 hover:text-flambe-rust text-foreground',
            isToday && !isSelected && 'border-2 border-flambe-rust text-flambe-rust',
            isSelected &&
              'bg-[#a1472a] text-white shadow-md scale-102'
          )}
        >
          {dayNum}
        </button>
      )
    }

    return cells
  }

  return (
    <div className="flex flex-col items-center py-0.5 text-center">
      <div className="w-full max-w-[300px] flex flex-col p-2.5 bg-background border rounded-xl shadow-xs">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={prevMonth}
            disabled={
              currentMonth.getFullYear() === today.getFullYear() &&
              currentMonth.getMonth() === today.getMonth()
            }
            className="p-1 sm:p-1.5 rounded-xl text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-serif text-sm font-bold text-foreground">
            {calendarMonthLabel()}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 sm:p-1.5 rounded-xl text-foreground hover:bg-secondary transition-all"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Weekday Headers starting on Monday */}
        <div className="grid grid-cols-7 gap-x-1.5 text-center mb-1.5">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
            <span
              key={day}
              className="text-[9px] font-bold tracking-wider text-muted-foreground/60 select-none py-0.5"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1.5 text-center">
          {renderCalendarCells()}
        </div>

        {/* Selected date preview footer inside card */}
        <div className="mt-2 pt-2 border-t border-border/60 text-xs font-semibold text-muted-foreground text-left">
          Đã chọn:{' '}
          <span className="text-[#a1472a]">
            {date ? formatDate(toISO(date)) : 'Chưa chọn'}
          </span>
        </div>
      </div>
    </div>
  )
}
