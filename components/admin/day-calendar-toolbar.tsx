import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import {
  DesktopCalendarActions,
  MobileCalendarActions,
} from '@/components/admin/day-calendar-actions'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import { addDaysToIso, isoFromDate } from '@/lib/admin-calendar'
import { formatDate } from '@/lib/restaurant'

export function DayCalendarToolbar({
  selectedDate,
  isCalendarOpen,
  isLoading,
  onCalendarOpenChange,
  onDateChange,
  onRefresh,
  onCreateReservation,
}: {
  selectedDate: string
  isCalendarOpen: boolean
  isLoading?: boolean
  onCalendarOpenChange: (open: boolean) => void
  onDateChange: (date: string) => void
  onRefresh?: () => void
  onCreateReservation?: () => void
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
          <DateNavigator
            selectedDate={selectedDate}
            isCalendarOpen={isCalendarOpen}
            onCalendarOpenChange={onCalendarOpenChange}
            onDateChange={onDateChange}
          />
          <MobileCalendarActions
            isLoading={isLoading}
            onDateChange={onDateChange}
            onRefresh={onRefresh}
            onCreateReservation={onCreateReservation}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden h-9 gap-2 bg-background lg:inline-flex"
            onClick={() => onDateChange(isoFromDate(new Date()))}
          >
            <CalendarDays className="size-4" />
            Hôm nay
          </Button>
        </div>
        <DesktopCalendarActions
          isLoading={isLoading}
          onRefresh={onRefresh}
          onCreateReservation={onCreateReservation}
        />
      </div>
    </div>
  )
}

function DateNavigator({
  selectedDate,
  isCalendarOpen,
  onCalendarOpenChange,
  onDateChange,
}: {
  selectedDate: string
  isCalendarOpen: boolean
  onCalendarOpenChange: (open: boolean) => void
  onDateChange: (date: string) => void
}) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] gap-2 lg:flex lg:items-center lg:gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        aria-label="Ngày trước"
        className="size-11 rounded-lg bg-background lg:size-9"
        onClick={() => onDateChange(addDaysToIso(selectedDate, -1))}
      >
        <ChevronLeft className="size-5 lg:size-4" />
      </Button>
      <Popover open={isCalendarOpen} onOpenChange={onCalendarOpenChange}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="h-11 w-full justify-center rounded-lg border bg-background px-3 text-center text-base font-bold shadow-xs lg:h-9 lg:w-44 lg:justify-start lg:text-left lg:text-sm"
            />
          }
        >
          <CalendarDays className="mr-2 size-5 shrink-0 text-foreground lg:size-4 lg:text-muted-foreground" />
          <span className="truncate">{formatDate(selectedDate)}</span>
        </PopoverTrigger>
        <PopoverContent
          className="animate-in fade-in-50 slide-in-from-top-1 w-auto border-none p-0 duration-150"
          align="start"
        >
          <RestaurantCalendar
            selected={new Date(`${selectedDate}T00:00:00`)}
            onSelect={(date) => {
              if (date) onDateChange(isoFromDate(date))
              onCalendarOpenChange(false)
            }}
          />
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        aria-label="Ngày sau"
        className="size-11 rounded-lg bg-background lg:size-9"
        onClick={() => onDateChange(addDaysToIso(selectedDate, 1))}
      >
        <ChevronRight className="size-5 lg:size-4" />
      </Button>
    </div>
  )
}
