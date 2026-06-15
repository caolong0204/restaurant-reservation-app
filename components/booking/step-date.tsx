'use client'

import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
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
      cells.push(<div key={`empty-${i}`} className="size-8 sm:size-10" />)
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
            'size-8 sm:size-10 mx-auto flex items-center justify-center text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200',
            isPast && 'text-muted-foreground/30 cursor-not-allowed',
            !isPast &&
              !isSelected &&
              'hover:bg-primary/10 hover:text-primary text-foreground',
            isToday && !isSelected && 'border-2 border-primary text-primary',
            isSelected &&
              'bg-primary text-primary-foreground shadow-md scale-105'
          )}
        >
          {dayNum}
        </button>
      )
    }

    return cells
  }

  return (
    <div className="flex flex-col items-center gap-3 py-1 sm:gap-4 sm:py-2 text-center">
      <div className="flex flex-col items-center">
        <CalendarIcon className="size-6 text-primary mb-1.5 sm:size-8 sm:mb-2" />
        <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground">
          Chọn ngày đặt bàn
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Vui lòng chọn ngày bạn muốn dùng bữa tại nhà hàng
        </p>
      </div>

      {/* Calendar Widget Container */}
      <div className="w-full max-w-md flex flex-col mt-2 p-3 sm:mt-4 sm:p-5 bg-background border rounded-2xl shadow-xs">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <button
            type="button"
            onClick={prevMonth}
            disabled={
              currentMonth.getFullYear() === today.getFullYear() &&
              currentMonth.getMonth() === today.getMonth()
            }
            className="p-1.5 sm:p-2 rounded-xl text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </button>
          <span className="font-serif text-base sm:text-lg font-bold text-foreground">
            {calendarMonthLabel()}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 sm:p-2 rounded-xl text-foreground hover:bg-secondary transition-all"
          >
            <ChevronRight className="size-4 sm:size-5" />
          </button>
        </div>

        {/* Weekday Headers starting on Monday */}
        <div className="grid grid-cols-7 gap-x-2 text-center mb-2 sm:mb-4">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <span
              key={day}
              className="text-[10px] font-bold tracking-wider text-muted-foreground/60 select-none py-1"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1.5 sm:gap-y-3 gap-x-2 text-center">
          {renderCalendarCells()}
        </div>

        {/* Selected date preview footer inside card */}
        <div className="mt-3 pt-2 sm:mt-6 sm:pt-4 border-t border-border/60 text-xs font-semibold text-muted-foreground text-left">
          Đã chọn:{' '}
          <span className="text-primary">
            {date ? formatDate(toISO(date)) : 'Chưa chọn'}
          </span>
        </div>
      </div>
    </div>
  )
}
