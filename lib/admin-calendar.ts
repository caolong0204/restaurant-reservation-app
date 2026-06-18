import type { CSSProperties } from 'react'

import { formatTime } from '@/lib/restaurant'
import { getBookingDurationMinutes, type Reservation, type ReservationStatus } from '@/lib/reservation-types'
import { formatInTimeZone } from 'date-fns-tz'

export const TERMINAL_STATUSES: ReservationStatus[] = ['completed', 'cancelled', 'no_show']

export function getTodayIso(): string {
  return formatInTimeZone(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd')
}

export function isPastReservation(reservationDate: string, todayIso: string): boolean {
  return reservationDate < todayIso
}

export const HALF_SLOT_WIDTH = 52

export function isoFromDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDaysToIso(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + days)
  return isoFromDate(date)
}

export function minutesFromTime(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

export function timeFromMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createHalfHourSlots(_selectedDate: string): string[] {
  const slots: string[] = []
  const start = minutesFromTime('10:00')
  // Mở rộng lưới hiển thị đến 22:30 để hiển thị được khoảng thời gian ăn của các booking cuối ngày
  const end = minutesFromTime('22:30')

  for (let minutes = start; minutes <= end; minutes += 30) {
    slots.push(timeFromMinutes(minutes))
  }

  return slots
}

export function isFullHourSlot(slot: string): boolean {
  return minutesFromTime(slot) % 60 === 0
}

export function getHeaderCellStyle(slot: string, slots: string[]): CSSProperties {
  const startIndex = slots.indexOf(slot)
  return {
    gridColumn: `${startIndex + 1} / span 1`,
    position: 'relative',
    overflow: 'visible',
  }
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Chờ duyệt',
  confirmed: 'Đã xác nhận',
  arrived: 'Đã đến',
  seated: 'Đang phục vụ',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
}

export function getSelectableStatuses(
  currentStatus: ReservationStatus,
  isPastDate: boolean
): Array<[ReservationStatus, string]> {
  const allEntries = Object.entries(STATUS_LABELS) as Array<[ReservationStatus, string]>
  if (!isPastDate) return allEntries
  
  // Không cho phép đổi trạng thái nếu booking ở quá khứ mà vẫn đang chờ duyệt (chưa xếp bàn)
  if (currentStatus === 'pending') {
    return allEntries.filter(([value]) => value === 'pending')
  }
  
  return allEntries.filter(([value]) => 
    value === currentStatus || TERMINAL_STATUSES.includes(value)
  )
}

export const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  confirmed: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  arrived: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  seated: 'border-purple-500/30 bg-purple-500/10 text-purple-700',
  completed: 'border-gray-500/30 bg-gray-500/10 text-gray-700',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  no_show: 'border-red-500/30 bg-red-600/10 text-red-700',
}

export const ROW_BG_STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-amber-50/40 hover:bg-amber-50/80 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 text-foreground',
  confirmed: 'bg-blue-50/40 hover:bg-blue-50/80 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 text-foreground',
  arrived: 'bg-emerald-50/40 hover:bg-emerald-50/80 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 text-foreground',
  seated: 'bg-purple-50/40 hover:bg-purple-50/80 dark:bg-purple-950/10 dark:hover:bg-purple-950/20 text-foreground',
  completed: 'bg-gray-50/40 hover:bg-gray-50/80 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 text-muted-foreground/90',
  cancelled: 'bg-zinc-50/50 hover:bg-zinc-100/80 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 text-muted-foreground/80',
  no_show: 'bg-red-50/30 hover:bg-red-50/60 dark:bg-red-950/10 dark:hover:bg-red-950/20 text-muted-foreground/80',
}

export function statusText(status: Reservation['status']): string {
  return STATUS_LABELS[status] || 'Chưa xác nhận'
}

export function durationLabel(minutes: number): string {
  return `${minutes / 60}h`
}

export function getBarClass(reservation: Reservation): string {
  switch (reservation.status) {
    case 'pending':
      return 'border-amber-700/30 bg-amber-500 text-amber-950'
    case 'confirmed':
      return 'border-blue-700/30 bg-blue-500 text-white'
    case 'arrived':
      return 'border-green-700/30 bg-green-500 text-white'
    case 'seated':
      return 'border-purple-700/30 bg-purple-500 text-white'
    case 'completed':
      return 'border-gray-700/30 bg-gray-500 text-white'
    case 'cancelled':
      return 'border-rose-300/30 bg-rose-300 text-rose-950'
    case 'no_show':
      return 'border-red-700/30 bg-red-600 text-white'
    default:
      return 'border-teal-700/30 bg-teal-600 text-white'
  }
}

export function getSlotAvailability(
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

export function getReservationGridStyle(
  reservation: Reservation,
  slots: string[],
): CSSProperties | null {
  const startMinutes = minutesFromTime(reservation.time)
  const duration = getBookingDurationMinutes(reservation.partySize)
  const endMinutes = startMinutes + duration
  const roundedStart = Math.floor(startMinutes / 30) * 30
  const roundedEnd = Math.ceil(endMinutes / 30) * 30
  const startSlot = timeFromMinutes(roundedStart)
  const endSlot = timeFromMinutes(roundedEnd)
  const startIndex = slots.indexOf(startSlot)

  if (startIndex < 0) return null

  const endIndex = slots.indexOf(endSlot)
  const safeEndIndex = endIndex < 0 ? slots.length : endIndex
  const leftOffsetMinutes = startMinutes - roundedStart
  const marginLeft = (leftOffsetMinutes / 30) * HALF_SLOT_WIDTH
  const rightOffsetMinutes = roundedEnd - endMinutes
  const marginRight = (rightOffsetMinutes / 30) * HALF_SLOT_WIDTH

  return {
    gridColumn: `${startIndex + 1} / ${safeEndIndex + 1}`,
    gridRow: '1',
    marginLeft: `${marginLeft}px`,
    marginRight: `${marginRight}px`,
  }
}

export function buildTimelineMetrics(selectedDate: string, activeTableCount: number, slots: string[]) {
  const labelledSlots = slots.filter(isFullHourSlot)
  const gridTemplateColumns = `repeat(${slots.length}, ${HALF_SLOT_WIDTH}px)`
  const timelineWidth = slots.length * HALF_SLOT_WIDTH

  return {
    labelledSlots,
    gridTemplateColumns,
    timelineWidth,
    activeTableCount,
  }
}

export function formatTimelineHeader(slot: string) {
  return formatTime(slot)
}
