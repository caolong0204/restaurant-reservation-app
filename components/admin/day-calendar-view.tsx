'use client'

import { useMemo, useState } from 'react'
import { Armchair, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, Loader2, Plus, RefreshCcw } from 'lucide-react'

import { CalendarReservationDetails } from '@/components/admin/calendar-reservation-details'
import { TimelineRow } from '@/components/admin/timeline-row'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import { cn } from '@/lib/utils'
import {
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  addDaysToIso,
  buildTimelineMetrics,
  createHalfHourSlots,
  formatTimelineHeader,
  getHeaderCellStyle,
  isoFromDate,
  HALF_SLOT_WIDTH,
  getTodayIso,
  isPastReservation,
} from '@/lib/admin-calendar'
import { formatDate } from '@/lib/restaurant'
import type { Reservation, ReservationStatus, RestaurantTable } from '@/lib/reservation-types'
import { useEffect } from 'react'

interface DayCalendarViewProps {
  reservations: Reservation[]
  tables: RestaurantTable[]
  selectedDate: string
  onDateChange: (date: string) => void
  onConfirm: (reservation: Reservation) => void | Promise<void>
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onUpdateStatus: (reservation: Reservation, status: ReservationStatus) => void
  updatingStatusId?: string | null
  isLoading?: boolean
  onRefresh?: () => void
  onCreateReservation?: () => void
}

export function DayCalendarView({
  reservations,
  tables,
  selectedDate,
  onDateChange,
  onConfirm,
  onCancel,
  onEdit,
  onUpdateStatus,
  updatingStatusId,
  isLoading,
  onRefresh,
  onCreateReservation,
}: DayCalendarViewProps) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [nowMs, setNowMs] = useState<number | null>(null)
  const [isPendingExpanded, setIsPendingExpanded] = useState(false)
  const [assigningPendingId, setAssigningPendingId] = useState<string | null>(null)

  const todayStr = useMemo(() => {
    void selectedDate // depend on selectedDate to re-calculate past midnight when navigating
    return getTodayIso()
  }, [selectedDate])
  const isPastDate = isPastReservation(selectedDate, todayStr)

  useEffect(() => {
    const updateTime = () => setNowMs(Date.now())
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const slots = useMemo(() => createHalfHourSlots(selectedDate), [selectedDate])
  const activeTables = useMemo(
    () => tables.filter((table) => table.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [tables],
  )
  const dayReservations = useMemo(
    () =>
      reservations
        .filter((reservation) => reservation.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, selectedDate],
  )

  const pendingUnassignedReservations = dayReservations.filter(
    (reservation) => reservation.status === 'pending' && !reservation.tableId,
  )
  const visiblePendingReservations = isPendingExpanded
    ? pendingUnassignedReservations
    : pendingUnassignedReservations.slice(0, 3)
  const hiddenPendingCount = Math.max(0, pendingUnassignedReservations.length - visiblePendingReservations.length)
  const assignedReservations = dayReservations.filter(
    (reservation) => reservation.tableId && reservation.status !== 'pending',
  )

  const handlePendingConfirm = async (reservation: Reservation) => {
    if (assigningPendingId) return
    setAssigningPendingId(reservation.id)
    try {
      await onConfirm(reservation)
    } finally {
      setAssigningPendingId(null)
    }
  }

  const { labelledSlots, gridTemplateColumns, timelineWidth } = buildTimelineMetrics(
    selectedDate,
    activeTables.length,
    slots,
  )

  let currentTimeIndicator = null
  if (nowMs) {
    const now = new Date(nowMs)
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const todayStr = `${y}-${m}-${d}`
    
    if (selectedDate === todayStr) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const calendarStart = 10 * 60 // 10:00
      const calendarEnd = 22 * 60 + 30 // 22:30
      
      if (currentMinutes >= calendarStart && currentMinutes <= calendarEnd) {
        const pixelsFromStart = (currentMinutes - calendarStart) * (HALF_SLOT_WIDTH / 30)
        const leftPos = 112 + pixelsFromStart // w-28 is 112px
        
        currentTimeIndicator = (
          <div 
            className="pointer-events-none absolute bottom-0 top-0 z-40 w-[2px] bg-primary shadow-[0_0_8px_rgba(210,159,14,0.35)]"
            style={{ left: `${leftPos}px` }}
          >
            <div className="absolute -left-1.5 -top-1.5 size-3.5 rounded-full border-2 border-white bg-primary" />
          </div>
        )
      }
    }
  }

  return (
    <div className={cn("grid gap-4", !isPastDate ? "xl:grid-cols-[minmax(0,1fr)_300px]" : "xl:grid-cols-1")}>
      <div className="min-w-0 space-y-4">
        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
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
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                  <PopoverContent className="animate-in fade-in-50 slide-in-from-top-1 w-auto border-none p-0 duration-150" align="start">
                    <RestaurantCalendar
                      selected={new Date(`${selectedDate}T00:00:00`)}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear()
                          const month = String(date.getMonth() + 1).padStart(2, '0')
                          const day = String(date.getDate()).padStart(2, '0')
                          onDateChange(`${year}-${month}-${day}`)
                        }
                        setIsCalendarOpen(false)
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
              <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1.35fr)] gap-2 lg:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-11 justify-center gap-2 rounded-lg bg-background px-3 text-sm font-bold"
                  onClick={() => onDateChange(isoFromDate(new Date()))}
                >
                  <CalendarDays className="size-5" />
                  Hôm nay
                </Button>
                {onRefresh && (
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Làm mới dữ liệu"
                    className="size-11 rounded-lg bg-background"
                    onClick={onRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCcw className={cn('size-5', isLoading && 'animate-spin')} />
                  </Button>
                )}
                {onCreateReservation && (
                  <Button
                    aria-label="Tạo đặt bàn"
                    className="flex h-11 min-w-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold shadow-xs"
                    onClick={onCreateReservation}
                  >
                    <Plus className="size-5" />
                    <span className="truncate">Tạo đặt bàn</span>
                  </Button>
                )}
              </div>
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
            <div className="hidden items-center justify-end gap-2 lg:flex">
              {onRefresh && (
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Làm mới dữ liệu"
                  className="size-9 shrink-0 rounded-lg bg-background"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCcw className={cn('size-4', isLoading && 'animate-spin')} />
                </Button>
              )}
              {onCreateReservation && (
                <Button
                  aria-label="Tạo đặt bàn"
                  className="flex h-9 w-auto shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold shadow-xs"
                  onClick={onCreateReservation}
                >
                  <Plus className="size-3.5" />
                  <span>Tạo đặt bàn</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-auto rounded-lg border border-border/80 bg-card shadow-xs">
          <div className="relative w-max">
            <table className="w-max caption-bottom border-separate border-spacing-0 text-sm">
              <TableHeader>
                <TableRow className="border-border bg-secondary hover:bg-secondary">
                  <TableHead className="sticky left-0 z-50 w-32 min-w-32 border-r border-border bg-secondary text-left font-bold text-foreground shadow-[3px_0_6px_-4px_rgba(0,0,0,0.35)]">
                    <div className="px-3">
                      <span className="block">Bàn</span>
                      <span className="text-[10px] font-medium text-muted-foreground">Sức chứa</span>
                    </div>
                  </TableHead>
                  <TableHead className="h-11 p-0">
                    <div
                      className="grid h-11 bg-secondary"
                      style={{ gridTemplateColumns, width: timelineWidth }}
                    >
                      {labelledSlots.map((slot, index) => (
                        <div
                          key={slot}
                          style={getHeaderCellStyle(slot, slots)}
                          className="flex items-center"
                        >
                          <span className={cn(
                            "whitespace-nowrap font-mono text-[10px] font-bold tabular-nums text-foreground",
                            index > 0 && "-translate-x-1/2"
                          )}>
                            {formatTimelineHeader(slot)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTables.map((table) => {
                  const tableReservations = assignedReservations.filter(
                    (reservation) =>
                      reservation.tableId === table.id ||
                      (reservation.secondaryTableIds && reservation.secondaryTableIds.includes(table.id)),
                  )

                  return (
                    <TimelineRow
                      key={table.id}
                      table={table}
                      tableReservations={tableReservations}
                      slots={slots}
                      gridTemplateColumns={gridTemplateColumns}
                      timelineWidth={timelineWidth}
                      onSelectReservation={setSelectedReservation}
                    />
                  )
                })}
              </TableBody>
            </table>

            {currentTimeIndicator}
          </div>
        </div>
      </div>

      {!isPastDate && (
        <aside className="rounded-lg border border-border/80 bg-card p-2 shadow-xs xl:sticky xl:top-4 xl:self-start">
        <div className="flex items-center justify-between gap-2 px-1.5 py-1.5">
          <h2 className="font-serif text-base font-bold text-foreground">Chờ gán bàn</h2>
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
            {pendingUnassignedReservations.length}
          </span>
        </div>

        <div className="mt-1 overflow-hidden rounded-lg border border-border/80 bg-background/55">
          {pendingUnassignedReservations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              Không có booking chờ gán bàn.
            </div>
          ) : (
            visiblePendingReservations.map((reservation) => (
              <div 
                key={reservation.id} 
                onClick={() => setSelectedReservation(reservation)}
                className="group grid cursor-pointer grid-cols-[1fr_auto] gap-3 border-b border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/30 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <Clock className="size-4 shrink-0 text-primary" />
                    <span className="font-mono text-sm font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
                      {reservation.time}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="truncate text-sm font-bold text-foreground">
                      {reservation.name}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 pl-6 text-xs text-muted-foreground">
                    <Armchair className="size-3.5" />
                    {reservation.partySize} khách
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={Boolean(assigningPendingId)}
                  aria-busy={assigningPendingId === reservation.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    void handlePendingConfirm(reservation)
                  }}
                  className="mt-6 h-8 rounded-lg border-primary/25 px-3 text-xs font-bold text-primary hover:bg-primary/10 relative z-10"
                >
                  {assigningPendingId === reservation.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    'Gán bàn'
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        {hiddenPendingCount > 0 || isPendingExpanded ? (
          <button
            type="button"
            onClick={() => setIsPendingExpanded((value) => !value)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10"
          >
            {isPendingExpanded ? 'Thu gọn' : `Xem thêm (${hiddenPendingCount})`}
            <ChevronDown className={cn('size-4 transition-transform', isPendingExpanded && 'rotate-180')} />
          </button>
        ) : null}
        </aside>
      )}

      {selectedReservation && (
        <CalendarReservationDetails
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onCancel={(reservation) => {
            onCancel(reservation)
            setSelectedReservation(null)
          }}
          onEdit={(reservation) => {
            onEdit(reservation)
            setSelectedReservation(null)
          }}
          onUpdateStatus={onUpdateStatus}
          isUpdatingStatus={updatingStatusId === selectedReservation.id}
        />
      )}
    </div>
  )
}
