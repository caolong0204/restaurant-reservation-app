import type { Reservation, ReservationStatus, RestaurantTable } from '@/lib/reservation-types'

export type ReservationSortField = 'date' | 'time' | 'createdAt'
export type ReservationSortOrder = 'asc' | 'desc'

export const TABLE_COLUMN_COUNT = 11

export const STICKY_ROW_BG_STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-amber-50 dark:bg-amber-950',
  confirmed: 'bg-emerald-50 dark:bg-emerald-950',
  arrived: 'bg-blue-50 dark:bg-blue-950',
  seated: 'bg-blue-50 dark:bg-blue-950',
  completed: 'bg-gray-50 dark:bg-gray-900',
  cancelled: 'bg-zinc-50 dark:bg-zinc-900',
  no_show: 'bg-red-50 dark:bg-red-950',
}

export function formatSheetDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${day}/${month}/${year}`
}

function formatTableShorthand(table: RestaurantTable): string {
  const numMatch = table.code.match(/\d+/)
  const num = numMatch ? numMatch[0].padStart(2, '0') : '00'
  const floorStr = table.floor === 'Tầng 1' ? 'T1' : 'T2'
  return `${num}(${floorStr})`
}

export function formatTableDisplay(reservation: Reservation): string {
  if (!reservation.table) return ''
  const main = formatTableShorthand(reservation.table)
  if (!reservation.secondaryTables || reservation.secondaryTables.length === 0) return main
  const secondary = reservation.secondaryTables.map(formatTableShorthand).join(' + ')
  return `${main} + ${secondary}`
}

export function sortReservations(
  reservations: Reservation[],
  sortField: ReservationSortField | null,
  sortOrder: ReservationSortOrder | null,
) {
  if (!sortField || !sortOrder) return reservations

  return [...reservations].sort((a, b) => {
    if (sortField === 'date') {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return sortOrder === 'asc' ? dateCompare : -dateCompare
      const timeCompare = a.time.localeCompare(b.time)
      if (timeCompare !== 0) return timeCompare
      return a.createdAt - b.createdAt
    }

    if (sortField === 'time') {
      const timeCompare = a.time.localeCompare(b.time)
      if (timeCompare !== 0) return sortOrder === 'asc' ? timeCompare : -timeCompare
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.createdAt - b.createdAt
    }

    const createdCompare = a.createdAt - b.createdAt
    if (createdCompare !== 0) return sortOrder === 'asc' ? createdCompare : -createdCompare
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.time.localeCompare(b.time)
  })
}
