import type { CSSProperties } from 'react'

import { formatTime } from '@/lib/restaurant'
import { getBookingDurationMinutes, type Reservation } from '@/lib/reservation-types'

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

export function statusText(status: Reservation['status']): string {
  if (status === 'confirmed') return 'Đã xác nhận'
  if (status === 'cancelled') return 'Đã hủy'
  return 'Chờ duyệt'
}

export function durationLabel(minutes: number): string {
  return `${minutes / 60}h`
}

export function getBarClass(reservation: Reservation): string {
  if (reservation.status === 'pending') {
    return 'border-amber-700/30 bg-amber-500 text-amber-950'
  }

  return 'border-teal-700/30 bg-teal-600 text-white'
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
