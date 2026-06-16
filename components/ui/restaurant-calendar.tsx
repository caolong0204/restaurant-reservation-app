'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

interface RestaurantCalendarProps {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  minDate?: Date
  className?: string
  showFooter?: boolean
}

function isoFromDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function RestaurantCalendar({
  selected,
  onSelect,
  minDate,
  className,
  showFooter = true,
}: RestaurantCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Initialize currentMonth based on selected date or today
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (selected) {
      return new Date(selected.getFullYear(), selected.getMonth(), 1)
    }
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  // Keep currentMonth in sync when selected date changes externally
  useEffect(() => {
    if (selected) {
      setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
    }
  }, [selected])

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
      cells.push(<div key={`empty-${i}`} className="size-8 sm:size-9" />)
    }

    // Days cells
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const cellDate = new Date(year, month, dayNum)

      // Determine if date is disabled (past or custom minDate)
      let isDisabled = false
      if (minDate) {
        const compDate = new Date(minDate)
        compDate.setHours(0, 0, 0, 0)
        isDisabled = cellDate < compDate
      }

      const isToday =
        cellDate.getDate() === today.getDate() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getFullYear() === today.getFullYear()

      const isSelected =
        selected &&
        cellDate.getDate() === selected.getDate() &&
        cellDate.getMonth() === selected.getMonth() &&
        cellDate.getFullYear() === selected.getFullYear()

      cells.push(
        <button
          key={`day-${dayNum}`}
          type="button"
          disabled={isDisabled}
          onClick={() => {
            onSelect(cellDate)
          }}
          className={cn(
            'size-8 sm:size-9 mx-auto flex items-center justify-center text-xs font-semibold rounded-lg transition-all duration-200',
            isDisabled && 'text-muted-foreground/30 cursor-not-allowed',
            !isDisabled &&
              !isSelected &&
              'hover:bg-primary/10 hover:text-primary text-foreground',
            isToday && !isSelected && 'border border-primary text-primary',
            isSelected &&
              'bg-primary text-primary-foreground shadow-sm scale-105'
          )}
        >
          {dayNum}
        </button>
      )
    }

    return cells
  }

  // Prevent navigation before minDate month if minDate is supplied
  const isPrevDisabled = () => {
    if (!minDate) return false
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    return currentMonth <= minMonth
  }

  return (
    <div className={cn('w-full max-w-sm flex flex-col p-3 bg-background border rounded-xl shadow-xs', className)}>
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          disabled={isPrevDisabled()}
          className="p-1 rounded-lg text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="font-serif text-sm font-bold text-foreground">
          {calendarMonthLabel()}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-lg text-foreground hover:bg-secondary transition-all"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Weekday Headers starting on Monday */}
      <div className="grid grid-cols-7 gap-x-1 text-center mb-1 border-b border-border/40 pb-1">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
          <span
            key={day}
            className="text-[9px] font-bold tracking-wider text-muted-foreground/75 select-none py-1"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
        {renderCalendarCells()}
      </div>

      {/* Selected date preview footer inside card */}
      {showFooter && (
        <div className="mt-3 pt-2 border-t border-border/60 text-[10px] font-bold text-muted-foreground text-left flex justify-between items-center">
          <span>
            Đã chọn:{' '}
            <span className="text-primary">
              {selected ? formatDate(isoFromDate(selected)) : 'Chưa chọn'}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
