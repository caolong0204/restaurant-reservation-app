import { formatInTimeZone } from 'date-fns-tz'

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
  // 10:30 to 22:30 in 15-minute increments.
  for (let h = 10; h <= 22; h++) {
    for (const m of [0, 15, 30, 45]) {
      if (h === 10 && m < 30) continue // starts at 10:30
      if (h === 22 && m > 30) continue
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
})()

function minutesFromTimeString(time: string): number {
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
export function getAvailableTimeSlots(partySize: number, dateIso?: string): string[] {
  if (dateIso) {
    const day = new Date(`${dateIso}T00:00:00`).getDay()
    if (day === 1) return [] // 1 is Monday
  }

  const lastBooking = getLastBookingTime(dateIso)
  const [lastH, lastM] = lastBooking.split(':').map(Number)
  const lastBookingMinutes = (lastH ?? 21) * 60 + (lastM ?? 0)

  return TIME_SLOTS.filter((slot) => {
    const slotMinutes = minutesFromTimeString(slot)
    return slotMinutes <= lastBookingMinutes
  })
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

export function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateLong(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
