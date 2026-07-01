import type { CSSProperties } from 'react'

import { formatTime } from '@/lib/restaurant'
import { getBookingDurationMinutes, type Reservation, type ReservationStatus } from '@/lib/reservation-types'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

export const TERMINAL_STATUSES: ReservationStatus[] = ['completed', 'cancelled', 'no_show']

/** Múi giờ cố định của nhà hàng. Dùng constant này thay vì hardcode chuỗi ở nhiều nơi. */
export const RESTAURANT_TZ = 'Asia/Ho_Chi_Minh'

export function getTodayIso(): string {
  return formatInTimeZone(new Date(), RESTAURANT_TZ, 'yyyy-MM-dd')
}

export function isReservationInServiceWindow(
  reservation: Pick<Reservation, 'date' | 'time' | 'partySize' | 'status'>,
  now = new Date(),
): boolean {
  if (reservation.status === 'pending' || TERMINAL_STATUSES.includes(reservation.status)) return false

  const todayIso = formatInTimeZone(now, RESTAURANT_TZ, 'yyyy-MM-dd')
  if (reservation.date !== todayIso) return false

  const nowMinutes = minutesFromTime(formatInTimeZone(now, RESTAURANT_TZ, 'HH:mm'))
  const startMinutes = minutesFromTime(reservation.time)
  const endMinutes = startMinutes + getBookingDurationMinutes(reservation.partySize)

  return nowMinutes >= startMinutes && nowMinutes < endMinutes
}

export function hasReservationServiceEnded(
  reservation: Pick<Reservation, 'date' | 'time' | 'partySize' | 'status'>,
  now = new Date(),
): boolean {
  if (reservation.status === 'pending') return false

  const todayIso = formatInTimeZone(now, RESTAURANT_TZ, 'yyyy-MM-dd')
  if (reservation.date < todayIso) return true
  if (reservation.date > todayIso) return false

  const nowMinutes = minutesFromTime(formatInTimeZone(now, RESTAURANT_TZ, 'HH:mm'))
  const startMinutes = minutesFromTime(reservation.time)
  const endMinutes = startMinutes + getBookingDurationMinutes(reservation.partySize)

  return nowMinutes >= endMinutes
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
  confirmed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  arrived: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  seated: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  completed: 'border-gray-500/30 bg-gray-500/10 text-gray-700',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  no_show: 'border-red-500/30 bg-red-600/10 text-red-700',
}

export const STATUS_TEXT_COLORS: Record<string, string> = {
  pending: 'text-amber-700',
  confirmed: 'text-green-700',
  serving: 'text-blue-700',
  completed: 'text-slate-700',
  cancelled: 'text-red-700',
}

export const ROW_BG_STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-amber-50/40 hover:bg-amber-50/80 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 text-foreground',
  confirmed: 'bg-emerald-50/40 hover:bg-emerald-50/80 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 text-foreground',
  arrived: 'bg-blue-50/40 hover:bg-blue-50/80 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 text-foreground',
  seated: 'bg-blue-50/40 hover:bg-blue-50/80 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 text-foreground',
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
      return 'border-emerald-700/30 bg-emerald-600 text-white'
    case 'arrived':
    case 'seated':
      return 'border-blue-700/30 bg-blue-600 text-white'
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

/**
 * Chuyển phút thành chuỗi đọc được: 90 → "1h 30m", 45 → "45m", 120 → "2h".
 * Khác với `durationLabel` (chỉ hiện giờ nguyên), hàm này hiện cả phút lẻ —
 * dùng cho thời gian thực tế có thể không tròn giờ.
 */
export function formatDurationMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Tính duration thực tế (phút) của booking để vẽ bar calendar.
 * - Nếu booking đã completed và có completedAt: dùng thời gian thực tế (start → completedAt).
 * - Ngược lại: dùng ước tính theo party size.
 */
export function getEffectiveDurationMinutes(reservation: Reservation): number {
  if (reservation.status === 'completed' && reservation.completedAt) {
    // Dùng fromZonedTime để convert thời gian địa phương nhà hàng sang UTC ms,
    // tránh hardcode offset +07:00 dễ sai khi app scale sang múi giờ khác.
    const startMs = fromZonedTime(
      `${reservation.date}T${reservation.time.slice(0, 5)}`,
      RESTAURANT_TZ,
    ).getTime()
    const actualMinutes = Math.round((reservation.completedAt - startMs) / 60_000)
    const estimated = getBookingDurationMinutes(reservation.partySize)
    // Clamp: tối thiểu 15 phút, tối đa là ước tính ban đầu
    return Math.min(Math.max(actualMinutes, 15), estimated)
  }
  return getBookingDurationMinutes(reservation.partySize)
}

/**
 * Kiểm tra booking có nằm trong phạm vi slot hiển thị không.
 * Dùng để skip lane assignment cho booking ngoài viewport — tránh gọi
 * getReservationGridStyle (hàm nặng hơn) chỉ để lấy null/non-null.
 */
function isWithinSlotBounds(reservation: Reservation, slots: string[]): boolean {
  const startMinutes = minutesFromTime(reservation.time)
  const duration = getBookingDurationMinutes(reservation.partySize)
  const endMinutes = startMinutes + duration
  const roundedStart = Math.floor(startMinutes / 30) * 30
  const roundedEnd = Math.ceil(endMinutes / 30) * 30
  const startSlot = timeFromMinutes(roundedStart)
  return slots.includes(startSlot) || slots.includes(timeFromMinutes(roundedEnd))
}

/**
 * Phân chia các booking chồng nhau trên cùng 1 hàng bàn vào các lane riêng biệt.
 * Terminal statuses (completed, cancelled, no_show) được ưu tiên xếp lên lane trên cùng.
 * Trả về: laneOf (map reservationId → lane index 0-based) và laneCount.
 */
export function computeLanes(
  reservations: Reservation[],
  slots: string[],
): { laneOf: Record<string, number>; laneCount: number } {
  // Terminal statuses lên trước để chiếm lane 0 khi có overlap
  const sorted = [...reservations].sort((a, b) => {
    const aTerminal = TERMINAL_STATUSES.includes(a.status) ? 0 : 1
    const bTerminal = TERMINAL_STATUSES.includes(b.status) ? 0 : 1
    if (aTerminal !== bTerminal) return aTerminal - bTerminal
    return minutesFromTime(a.time) - minutesFromTime(b.time)
  })

  const laneOf: Record<string, number> = {}
  // laneEnd[i] = endMinutes của booking cuối cùng được xếp vào lane i
  const laneEnd: number[] = []

  for (const reservation of sorted) {
    const startMinutes = minutesFromTime(reservation.time)
    // Dùng estimated duration cho overlap check (bàn bị block trong toàn bộ slot ước tính)
    const duration = getBookingDurationMinutes(reservation.partySize)
    const endMinutes = startMinutes + duration

    if (!isWithinSlotBounds(reservation, slots)) {
      laneOf[reservation.id] = 0
      continue
    }

    // Tìm lane đầu tiên không overlap
    let assignedLane = -1
    for (let i = 0; i < laneEnd.length; i++) {
      if (startMinutes >= laneEnd[i]) {
        assignedLane = i
        laneEnd[i] = endMinutes
        break
      }
    }
    if (assignedLane === -1) {
      assignedLane = laneEnd.length
      laneEnd.push(endMinutes)
    }
    laneOf[reservation.id] = assignedLane
  }

  return { laneOf, laneCount: Math.max(laneEnd.length, 1) }
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
