export const RESTAURANT = {
  name: 'Maison Laurent',
  tagline: 'Ẩm thực Pháp theo mùa',
  address: '218 Pearl Street, San Francisco, CA',
  phone: '(415) 555-0100',
  hours: 'Thứ 3 – Chủ Nhật · 17:00 – 23:00',
}

export const TIME_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
]

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
