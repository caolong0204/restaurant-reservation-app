import type { Reservation, ReservationStatus, RestaurantTable, TableAvailabilityStatus } from '@/lib/reservation-types'

import type { ReservationRow, RestaurantTableRow } from '@/lib/reservations/types'
import { dateFromTimestamp, normalizeTime } from '@/lib/reservations/shared'

type TableLikeRow = Pick<
  RestaurantTableRow,
  'id' | 'code' | 'floor' | 'area' | 'capacity' | 'active' | 'sort_order' | 'notes'
> & {
  availability_status?: string | null
}

const VALID_AVAILABILITY = new Set<TableAvailabilityStatus>(['active', 'held_for_walk_in', 'inactive'])

export function mapTable(row: TableLikeRow): RestaurantTable {
  const rawStatus = row.availability_status ?? (row.active ? 'active' : 'inactive')
  const availabilityStatus: TableAvailabilityStatus = VALID_AVAILABILITY.has(rawStatus as TableAvailabilityStatus)
    ? (rawStatus as TableAvailabilityStatus)
    : 'inactive'

  return {
    id: row.id,
    code: row.code,
    floor: row.floor === 'Tầng 2' ? 'Tầng 2' : 'Tầng 1',
    area: row.area,
    capacity: row.capacity,
    active: availabilityStatus === 'active',
    availabilityStatus: availabilityStatus as TableAvailabilityStatus,
    sortOrder: row.sort_order,
    notes: row.notes ?? undefined,
  }
}

export function mapReservation(row: ReservationRow, tables: RestaurantTable[]): Reservation {
  const table = row.table_id ? tables.find((item) => item.id === row.table_id) : undefined
  const secondaryTableIds = row.secondary_table_ids ? row.secondary_table_ids.split(',').filter(Boolean) : []
  const secondaryTables = secondaryTableIds
    .map((id) => tables.find((item) => item.id === id))
    .filter((tableItem): tableItem is RestaurantTable => !!tableItem)

  return {
    id: row.id,
    name: row.guest_name,
    phone: row.guest_phone,
    email: row.guest_email ?? undefined,
    date: row.reservation_date,
    time: normalizeTime(row.reservation_time),
    partySize: row.party_size,
    occasion: row.occasion ?? undefined,
    tableLocation: row.requested_area ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status as ReservationStatus,
    manualArrangement: row.manual_arrangement,
    tableId: row.table_id ?? undefined,
    table,
    secondaryTableIds,
    secondaryTables,
    createdAt: dateFromTimestamp(row.created_at),
    updatedAt: dateFromTimestamp(row.updated_at),
    completedAt: row.completed_at ? dateFromTimestamp(row.completed_at) : undefined,
    locale: row.locale === 'en' ? 'en' : 'vi',
  }
}
