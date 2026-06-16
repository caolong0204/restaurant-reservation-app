'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import { formatDate, formatDateLong, formatTime, getLastBookingTime } from '@/lib/restaurant'
import {
  getBookingDurationMinutes,
  type Reservation,
  type RestaurantTable,
} from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

const HALF_SLOT_WIDTH = 52

interface DayCalendarViewProps {
  reservations: Reservation[]
  tables: RestaurantTable[]
  selectedDate: string
  onDateChange: (date: string) => void
  onConfirm: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
}

function isoFromDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + days)
  return isoFromDate(date)
}

function minutesFromTime(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

function timeFromMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function createHalfHourSlots(selectedDate: string): string[] {
  const slots: string[] = []
  const start = minutesFromTime('10:00')
  const end = minutesFromTime(getLastBookingTime(selectedDate))

  for (let minutes = start; minutes <= end; minutes += 30) {
    slots.push(timeFromMinutes(minutes))
  }

  return slots
}

function isFullHourSlot(slot: string): boolean {
  return minutesFromTime(slot) % 60 === 0
}

function getHeaderCellStyle(slot: string, slots: string[]): CSSProperties {
  const startIndex = slots.indexOf(slot)
  return {
    gridColumn: `${startIndex + 1} / span 1`,
    position: 'relative',
    overflow: 'visible',
  }
}

function statusText(status: Reservation['status']): string {
  if (status === 'confirmed') return 'Đã xác nhận'
  if (status === 'cancelled') return 'Đã hủy'
  return 'Chờ duyệt'
}

function durationLabel(minutes: number): string {
  if (minutes % 60 === 0) return `${minutes / 60} tiếng`
  return `${minutes / 60} tiếng`
}

function getBarClass(reservation: Reservation): string {
  if (reservation.status === 'pending') {
    return 'border-amber-700/30 bg-amber-500 text-amber-950'
  }

  return 'border-teal-700/30 bg-teal-600 text-white'
}

function getSlotAvailability(
  slot: string,
  tableIds: string[],
  reservations: Reservation[],
): number {
  const slotStart = minutesFromTime(slot)
  const occupiedTables = new Set<string>()

  reservations.forEach((reservation) => {
    if (!reservation.tableId || reservation.status === 'cancelled') return

    const reservationStart = minutesFromTime(reservation.time)
    const duration = getBookingDurationMinutes(reservation.partySize)
    const isOccupied = slotStart >= reservationStart && slotStart < reservationStart + duration

    if (isOccupied) {
      occupiedTables.add(reservation.tableId)
      if (reservation.secondaryTableIds) {
        reservation.secondaryTableIds.forEach((id) => occupiedTables.add(id))
      }
    }
  })

  return tableIds.length - occupiedTables.size
}

function getReservationGridStyle(
  reservation: Reservation,
  slots: string[],
): CSSProperties | null {
  const startMinutes = minutesFromTime(reservation.time)
  const duration = getBookingDurationMinutes(reservation.partySize)
  const endMinutes = startMinutes + duration

  // Round start DOWN to nearest 30 minutes
  const roundedStart = Math.floor(startMinutes / 30) * 30
  // Round end UP to nearest 30 minutes
  const roundedEnd = Math.ceil(endMinutes / 30) * 30

  const startSlotStr = timeFromMinutes(roundedStart)
  const endSlotStr = timeFromMinutes(roundedEnd)

  const startIndex = slots.indexOf(startSlotStr)
  if (startIndex < 0) return null

  const endIndex = slots.indexOf(endSlotStr)
  const safeEndIndex = endIndex < 0 ? slots.length : endIndex

  const leftOffsetMinutes = startMinutes - roundedStart
  const marginLeft = (leftOffsetMinutes / 30) * 52

  const rightOffsetMinutes = roundedEnd - endMinutes
  const marginRight = (rightOffsetMinutes / 30) * 52

  return {
    gridColumn: `${startIndex + 1} / ${safeEndIndex + 1}`,
    gridRow: '1',
    marginLeft: `${marginLeft}px`,
    marginRight: `${marginRight}px`,
  }
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
  const occupiedSlots = slots.reduce((sum, slot) => {
    return sum + activeTables.length - getSlotAvailability(slot, tableIds, assignedReservations)
  }, 0)
  const totalSlots = activeTables.length * slots.length
  const availableSlots = totalSlots - occupiedSlots
  // Only full-hour slots get a time label; half-hour slots just show availability
  const labelledSlots = useMemo(() => slots.filter(isFullHourSlot), [slots])
  const gridTemplateColumns = `repeat(${slots.length}, ${HALF_SLOT_WIDTH}px)`
  const timelineWidth = slots.length * HALF_SLOT_WIDTH

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
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              onClick={() => onDateChange(addDays(selectedDate, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-10 w-48 rounded-lg bg-background text-sm font-semibold justify-start pl-3 text-left border shadow-xs"
                  />
                }
              >
                <CalendarDays className="size-4 mr-2 text-muted-foreground shrink-0" />
                <span className="truncate">{formatDate(selectedDate)}</span>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none animate-in fade-in-50 slide-in-from-top-1 duration-150" align="end">
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
              onClick={() => onDateChange(addDays(selectedDate, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
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
            Chưa gán bàn: {dayReservations.filter((reservation) => !reservation.tableId && reservation.status !== 'cancelled').length}
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
              <TableHead className="sticky left-0 z-30 w-28 min-w-28 border-r border-border bg-card font-bold text-foreground">
                Bàn
              </TableHead>
              <TableHead className="h-10 p-0">
                <div
                  className="grid h-10 bg-card"
                  style={{ gridTemplateColumns, width: timelineWidth }}
                >
                  {labelledSlots.map((slot) => (
                    <div
                      key={slot}
                      style={getHeaderCellStyle(slot, slots)}
                      className="flex items-center"
                    >
                      <span className="whitespace-nowrap font-mono text-[10px] font-bold text-foreground">
                        {formatTime(slot)}
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
              <TableRow key={table.id} className="border-border hover:bg-transparent">
                <TableCell className="sticky left-0 z-20 h-16 border-r border-border bg-card font-bold text-foreground">
                  <div className="leading-none">
                    {table.code}({table.floor === 'Tầng 1' ? 'T1' : 'T2'})
                  </div>
                  <div className="mt-1 text-xs font-medium leading-none text-muted-foreground">
                    {table.capacity} ghế
                  </div>
                </TableCell>
                <TableCell className="h-16 p-0">
                  <div
                    className="grid h-16 bg-background"
                    style={{ gridTemplateColumns, width: timelineWidth }}
                  >
                    {slots.map((slot, index) => (
                      <div
                        key={`${table.id}-${slot}`}
                        style={{ gridColumn: index + 1 }}
                        className={cn(
                          'row-start-1 border-r',
                          ((minutesFromTime(slot) + 30) % 60 === 0) ? 'border-border/75' : 'border-border/25',
                        )}
                      />
                    ))}
                    {tableReservations.map((reservation) => {
                      const style = getReservationGridStyle(reservation, slots)
                      if (!style) return null
                      const isSecondary = reservation.tableId !== table.id

                      return (
                        <button
                          key={reservation.id}
                          type="button"
                          onClick={() => setSelectedReservation(reservation)}
                          style={style}
                          className={cn(
                            'z-10 mx-0.5 my-3 flex h-10 items-center justify-between gap-2 rounded-sm border px-2 text-left text-xs font-bold shadow-sm ring-1 ring-black/5 transition-transform hover:-translate-y-0.5',
                            getBarClass(reservation),
                            isSecondary && 'opacity-65 border-dashed border-primary bg-teal-700/35 text-white/90',
                          )}
                          title={`${reservation.name} - ${statusText(reservation.status)}${isSecondary ? ' (Bàn phụ ghép thêm)' : ''}`}
                        >
                          <span className="min-w-0 truncate">
                            {isSecondary ? `[Ghép] ${reservation.name}` : reservation.name}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-black/10 px-1 py-0.5 text-[11px] leading-none">
                            <span className="inline-flex items-center gap-0.5">
                              <Users className="size-3" />
                              {reservation.partySize}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{durationLabel(getBookingDurationMinutes(reservation.partySize))}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in scale-in duration-200">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Chi tiết đặt bàn
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Mã đặt bàn: {selectedReservation.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[58dvh] overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên khách hàng</span>
                  <span className="font-serif text-base font-bold text-foreground">{selectedReservation.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'mt-0.5 rounded-md font-semibold text-xs',
                      selectedReservation.status === 'confirmed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' :
                      selectedReservation.status === 'cancelled' ? 'border-rose-500/30 bg-rose-500/10 text-rose-700' :
                      'border-amber-500/30 bg-amber-500/10 text-amber-700'
                    )}
                  >
                    {statusText(selectedReservation.status)}
                  </Badge>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Số điện thoại</span>
                  <span className="font-mono text-foreground">{selectedReservation.phone}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
                  <span className="text-foreground">{selectedReservation.email}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Ngày đặt bàn</span>
                  <span className="text-foreground">{selectedReservation.date.split('-').reverse().join('/')}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Giờ đặt bàn</span>
                  <span className="text-foreground">{selectedReservation.time}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Số lượng khách</span>
                  <span className="font-bold text-foreground">{selectedReservation.partySize} người</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Bàn chỉ định</span>
                  <span className="font-bold text-primary">
                    {selectedReservation.table ? (
                      <>
                        {selectedReservation.table.code}
                        {selectedReservation.secondaryTables && selectedReservation.secondaryTables.length > 0 && (
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            (ghép: {selectedReservation.secondaryTables.map((t) => t.code).join(', ')})
                          </span>
                        )}
                      </>
                    ) : (
                      'Chưa gán bàn'
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Vị trí mong muốn</span>
                  <span className="text-foreground">{selectedReservation.tableLocation || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Dịp đặc biệt</span>
                  <span className="text-foreground">{selectedReservation.occasion || '-'}</span>
                </div>
              </div>

              {selectedReservation.notes && (
                <div className="rounded-lg bg-secondary/35 p-3 border border-border/40">
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Ghi chú từ khách</span>
                  <p className="text-sm italic text-muted-foreground/90 font-serif">“{selectedReservation.notes}”</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4 bg-muted/20">
              {selectedReservation.status !== 'confirmed' && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onConfirm(selectedReservation)
                    setSelectedReservation(null)
                  }}
                  className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Check className="size-3.5" />
                  Gán bàn
                </Button>
              )}
              {selectedReservation.status !== 'cancelled' && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onCancel(selectedReservation)
                    setSelectedReservation(null)
                  }}
                  className="gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <X className="size-3.5" />
                  Hủy
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  onEdit(selectedReservation)
                  setSelectedReservation(null)
                }}
              >
                Sửa
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedReservation(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
