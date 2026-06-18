'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import { CalendarReservationDetails } from '@/components/admin/calendar-reservation-details'
import { TimelineRow } from '@/components/admin/timeline-row'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import { cn } from '@/lib/utils'
import {
  Table,
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
  getSlotAvailability,
  isoFromDate,
} from '@/lib/admin-calendar'
import { formatDate, formatDateLong } from '@/lib/restaurant'
import type { Reservation, RestaurantTable } from '@/lib/reservation-types'

interface DayCalendarViewProps {
  reservations: Reservation[]
  tables: RestaurantTable[]
  selectedDate: string
  onDateChange: (date: string) => void
  onConfirm: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
}

export function DayCalendarView({
  reservations,
  tables,
  selectedDate,
  onDateChange,
  onConfirm,
  onCancel,
  onEdit,
}: DayCalendarViewProps) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

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

  const assignedReservations = dayReservations.filter(
    (reservation) => reservation.tableId && reservation.status !== 'cancelled',
  )
  const tableIds = activeTables.map((table) => table.id)
  const occupiedSlots = slots.reduce(
    (sum, slot) => sum + activeTables.length - getSlotAvailability(slot, tableIds, assignedReservations),
    0,
  )
  const totalSlots = activeTables.length * slots.length
  const availableSlots = totalSlots - occupiedSlots
  const unassignedCount = dayReservations.filter(
    (reservation) => !reservation.tableId && reservation.status !== 'cancelled',
  ).length
  const { labelledSlots, gridTemplateColumns, timelineWidth } = buildTimelineMetrics(
    selectedDate,
    activeTables.length,
    slots,
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Lịch bàn theo khung giờ
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mỗi ô = 30 phút. Nhãn giờ hiển thị mỗi giờ tròn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-10 gap-2"
              onClick={() => onDateChange(isoFromDate(new Date()))}
            >
              <CalendarDays className="size-4" />
              Hôm nay
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={() => onDateChange(addDaysToIso(selectedDate, -1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-10 w-48 justify-start rounded-lg border bg-background pl-3 text-left text-sm font-semibold shadow-xs"
                    />
                  }
                >
                  <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{formatDate(selectedDate)}</span>
                </PopoverTrigger>
                <PopoverContent className="animate-in fade-in-50 slide-in-from-top-1 w-auto border-none p-0 duration-150" align="end">
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
                onClick={() => onDateChange(addDaysToIso(selectedDate, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <Badge variant="outline" className="rounded-md bg-emerald-100/70 text-emerald-900">
            Trống: {availableSlots}
          </Badge>
          <Badge variant="outline" className="rounded-md bg-rose-100 text-rose-950">
            Đã giữ bàn: {occupiedSlots}
          </Badge>
          <Badge variant="outline" className="rounded-md bg-background text-foreground">
            {formatDateLong(selectedDate)}
          </Badge>
          <Badge variant="outline" className="rounded-md bg-amber-100 text-amber-950">
            Chưa gán bàn: {unassignedCount}
          </Badge>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-border bg-card shadow-sm">
        <Table className="w-max border-collapse text-sm">
          <TableHeader>
            <TableRow className="border-border bg-lime-500 hover:bg-lime-500">
              <TableHead className="sticky left-0 z-30 w-28 min-w-28 border-r border-lime-700 bg-lime-500 text-center font-black text-lime-950">
                Chọn ngày
              </TableHead>
              <TableHead className="h-12 p-0">
                <div
                  className="flex h-12 items-center border-r border-lime-700 px-3 font-mono text-lg font-black text-lime-950"
                  style={{ width: timelineWidth }}
                >
                  {selectedDate.split('-').reverse().join('/')}
                </div>
              </TableHead>
            </TableRow>
            <TableRow className="border-border bg-card hover:bg-card">
              <TableHead className="sticky left-0 z-30 w-28 min-w-28 border-r border-border bg-card text-center font-bold text-foreground">
                Bàn
              </TableHead>
              <TableHead className="h-10 p-0">
                <div
                  className="grid h-10 bg-card"
                  style={{ gridTemplateColumns, width: timelineWidth }}
                >
                  {labelledSlots.map((slot, index) => (
                    <div
                      key={slot}
                      style={getHeaderCellStyle(slot, slots)}
                      className="flex items-center"
                    >
                      <span className={cn(
                        "whitespace-nowrap font-mono text-[10px] font-bold text-foreground",
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
        </Table>
      </div>

      {selectedReservation && (
        <CalendarReservationDetails
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onConfirm={(reservation) => {
            onConfirm(reservation)
            setSelectedReservation(null)
          }}
          onCancel={(reservation) => {
            onCancel(reservation)
            setSelectedReservation(null)
          }}
          onEdit={(reservation) => {
            onEdit(reservation)
            setSelectedReservation(null)
          }}
        />
      )}
    </div>
  )
}
