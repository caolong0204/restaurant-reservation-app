export const RESTAURANT = {
  name: 'Flambé',
  tagline: 'Ẩm thực Pháp theo mùa',
  address: '23 Gia Ngư, Hà Nội',
  phone: '0927355656',
  hours: 'Thứ 2 – Chủ Nhật · 10:00 – 22:30',
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

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return dateIso === `${year}-${month}-${day}`
}

export function isPastTimeSlot(time: string, dateIso?: string): boolean {
  if (!isTodayDate(dateIso)) return false

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const slotMinutes = minutesFromTimeString(time)

  return slotMinutes <= nowMinutes
}

/** The latest time shown for the operating day (HH:MM). */
export const RESTAURANT_CLOSE_TIME = '22:30'

/**
 * Last visible booking/calendar slot: 22:00 on weekdays (Mon–Thu), 22:30 on weekends (Fri–Sun).
 * Pass the selected date ISO string (YYYY-MM-DD) to get the correct cutoff.
 */
export function getLastBookingTime(dateIso?: string): string {
  if (!dateIso) return '22:00'
  const day = new Date(`${dateIso}T00:00:00`).getDay() // 0=Sun,5=Fri,6=Sat
  return day === 0 || day === 5 || day === 6 ? '22:30' : '22:00'
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
  const duration = getBookingDuration(partySize)
  const lastBooking = getLastBookingTime(dateIso)
  const [closeH, closeM] = RESTAURANT_CLOSE_TIME.split(':').map(Number)
  const closeMinutes = (closeH ?? 23) * 60 + (closeM ?? 0)
  const [lastH, lastM] = lastBooking.split(':').map(Number)
  const lastBookingMinutes = (lastH ?? 21) * 60 + (lastM ?? 0)
  return TIME_SLOTS.filter((slot) => {
    const slotMinutes = minutesFromTimeString(slot)
    return slotMinutes <= lastBookingMinutes && slotMinutes + duration <= closeMinutes
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
