import { formatInTimeZone } from 'date-fns-tz'
import type { RestaurantWeeklyHour } from '@/lib/reservation-types'

export const RESTAURANT = {
  name: 'Flambé',
  tagline: 'Flammkuchen và những người bạn',
  description: 'Nơi lửa, thủ công và tình bạn hòa quyện trong từng món ăn.',
  address: '23 Gia Ngư, Hoàn Kiếm, Hà Nội',
  phone: '+84 927 355 656',
  phoneRaw: '0927355656',
  email: 'Flambe.vn@gmail.com',
  hours: [
    'Thứ Ba - Thứ Sáu: 10:30 - 22:00',
    'Thứ Bảy - Chủ Nhật: 10:30 - 23:00',
  ],
}

export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = []
  for (let h = 0; h <= 23; h++) {
    for (const m of [0, 15, 30, 45]) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
})()

export const DEFAULT_WEEKLY_HOURS: RestaurantWeeklyHour[] = [
  { weekday: 1, isOpen: false, openTime: '10:30', closeTime: '22:00', lastBookingTime: '21:00' },
  { weekday: 2, isOpen: true, openTime: '10:30', closeTime: '22:00', lastBookingTime: '21:00' },
  { weekday: 3, isOpen: true, openTime: '10:30', closeTime: '22:00', lastBookingTime: '21:00' },
  { weekday: 4, isOpen: true, openTime: '10:30', closeTime: '22:00', lastBookingTime: '21:00' },
  { weekday: 5, isOpen: true, openTime: '10:30', closeTime: '22:00', lastBookingTime: '21:30' },
  { weekday: 6, isOpen: true, openTime: '10:30', closeTime: '23:00', lastBookingTime: '21:30' },
  { weekday: 7, isOpen: true, openTime: '10:30', closeTime: '23:00', lastBookingTime: '21:30' },
]

const WEEKDAY_LABELS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']

export function minutesFromTimeString(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

export function isTodayDate(dateIso?: string): boolean {
  if (!dateIso) return false

  const nowStr = formatInTimeZone(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd')
  return dateIso === nowStr
}

export function isPastTimeSlot(time: string, dateIso?: string): boolean {
  if (!isTodayDate(dateIso)) return false

  const timeStr = formatInTimeZone(new Date(), 'Asia/Ho_Chi_Minh', 'HH:mm')
  const [h, m] = timeStr.split(':').map(Number)
  const nowMinutes = (h ?? 0) * 60 + (m ?? 0)
  const slotMinutes = minutesFromTimeString(time)

  return slotMinutes <= nowMinutes
}

/**
 * Closing time: 22:00 on weekdays (Mon–Thu), 22:30 on weekends (Fri–Sun).
 */
export function getClosingTime(dateIso?: string): string {
  if (!dateIso) return '22:00'
  const day = new Date(`${dateIso}T00:00:00`).getDay() // 0=Sun,5=Fri,6=Sat
  return day === 0 || day === 5 || day === 6 ? '22:30' : '22:00'
}

/**
 * Last visible booking/calendar slot: 30 minutes before closing time.
 * Pass the selected date ISO string (YYYY-MM-DD) to get the correct cutoff.
 */
export function getLastBookingTime(dateIso?: string): string {
  if (!dateIso) return '21:00'
  const day = new Date(`${dateIso}T00:00:00`).getDay() // 0=Sun,5=Fri,6=Sat
  return day === 0 || day === 5 || day === 6 ? '21:30' : '21:00'
}

export function getWeeklyHourForDate(
  dateIso: string | undefined,
  weeklyHours: RestaurantWeeklyHour[] = DEFAULT_WEEKLY_HOURS,
) {
  if (!dateIso) return undefined
  const jsDay = new Date(`${dateIso}T00:00:00`).getDay()
  const isoDay = jsDay === 0 ? 7 : jsDay
  return weeklyHours.find((item) => item.weekday === isoDay)
}

/**
 * Booking duration in minutes based on party size:
 * 1–4 khách → 120 phút, 5–6 khách → 150 phút, 7+ → 180 phút (tuỳ chỉnh)
 */
export function getBookingDuration(partySize: number): number {
  if (partySize <= 4) return 120
  if (partySize <= 6) return 150
  return 180
}

/**
 * Returns the subset of TIME_SLOTS that fit within operating hours for the given date and party size.
 */
export function getAvailableTimeSlots(
  partySize: number,
  dateIso?: string,
  weeklyHours: RestaurantWeeklyHour[] = DEFAULT_WEEKLY_HOURS,
): string[] {
  const schedule = getWeeklyHourForDate(dateIso, weeklyHours)
  if (schedule && !schedule.isOpen) return []

  const openMinutes = minutesFromTimeString(schedule?.openTime ?? '10:30')
  const lastBookingMinutes = minutesFromTimeString(schedule?.lastBookingTime ?? getLastBookingTime(dateIso))

  return TIME_SLOTS.filter((slot) => {
    const slotMinutes = minutesFromTimeString(slot)
    return slotMinutes >= openMinutes && slotMinutes <= lastBookingMinutes
  })
}

export function formatOperatingHoursLabels(
  weeklyHours: RestaurantWeeklyHour[] = DEFAULT_WEEKLY_HOURS,
  showClosedDays = false,
): string[] {
  const labels: string[] = []
  let groupStart = 0

  const labelForRange = (start: number, end: number) => {
    const first = WEEKDAY_LABELS[start]
    const last = WEEKDAY_LABELS[end]
    return first === last ? first : `${first} - ${last}`
  }

  const signature = (item: RestaurantWeeklyHour) =>
    item.isOpen ? `open:${item.openTime}:${item.closeTime}` : 'closed'

  const sorted = [...weeklyHours].sort((a, b) => a.weekday - b.weekday)
  for (let index = 1; index <= sorted.length; index += 1) {
    const prev = sorted[index - 1]
    const current = sorted[index]
    if (current && signature(current) === signature(prev)) continue

    if (prev.isOpen || showClosedDays) {
      const range = labelForRange(groupStart, index - 1)
      labels.push(prev.isOpen ? `${range}: ${prev.openTime} - ${prev.closeTime}` : `${range}: Nghỉ`)
    }
    groupStart = index
  }

  return labels
}

export const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8]

export const OCCASIONS = [
  'Không có dịp đặc biệt',
  'Sinh nhật',
  'Kỷ niệm',
  'Hẹn hò',
  'Tiệc xã giao/công việc',
  'Tiệc chúc mừng',
]

export const TABLE_LOCATIONS = [
  'Không yêu cầu',
  'Tầng 1',
  'Tầng 2',
]

export function formatTime(time: string) {
  return time
}

// Parse YYYY-MM-DD từ Supabase an toàn, không phụ thuộc vào timezone parsing của JS
function parseSafeDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(iso: string) {
  if (!iso) return ''
  const d = parseSafeDate(iso)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateLong(iso: string) {
  if (!iso) return ''
  const d = parseSafeDate(iso)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
