export const RESTAURANT = {
  name: 'Maison Laurent',
  tagline: 'Seasonal French dining',
  address: '218 Pearl Street, San Francisco, CA',
  phone: '(415) 555-0100',
  hours: 'Tue – Sun · 5:00pm – 11:00pm',
}

export const TIME_SLOTS = [
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
]

export const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8]

export const OCCASIONS = [
  'No special occasion',
  'Birthday',
  'Anniversary',
  'Date night',
  'Business dinner',
  'Celebration',
]

export function formatTime(time: string) {
  const [hStr, m] = time.split(':')
  const h = Number(hStr)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${m} ${period}`
}

export function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateLong(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
