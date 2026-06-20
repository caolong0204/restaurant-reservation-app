import {
  CheckCircle2,
  EyeOff,
  ShieldAlert,
  Table2,
  type LucideIcon,
} from 'lucide-react'

import type {
  Reservation,
  RestaurantTable,
  RestaurantTableInput,
  TableAvailabilityStatus,
} from '@/lib/reservation-types'

export const STATUS_LABELS: Record<TableAvailabilityStatus, string> = {
  active: 'Đang dùng',
  held_for_walk_in: 'Giữ walk-in',
  inactive: 'Tắt',
}

export const STATUS_STYLES: Record<TableAvailabilityStatus, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  held_for_walk_in: 'border-amber-200 bg-amber-50 text-amber-800',
  inactive: 'border-slate-200 bg-slate-50 text-slate-600',
}

export const BLOCKING_STATUSES = new Set(['confirmed', 'arrived', 'seated', 'completed'])

export type TableCounts = {
  total: number
  active: number
  walkIn: number
  inactive: number
}

export const SUMMARY_CARDS: Array<[string, keyof TableCounts, LucideIcon]> = [
  ['Tổng bàn', 'total', Table2],
  ['Đang dùng', 'active', CheckCircle2],
  ['Giữ walk-in', 'walkIn', ShieldAlert],
  ['Tắt', 'inactive', EyeOff],
]

export type StatusFilter = TableAvailabilityStatus | 'all'
export type TableFormState = RestaurantTableInput

export const emptyTableForm: TableFormState = {
  code: '',
  floor: 'Tầng 1',
  area: 'Tầng 1',
  capacity: 2,
  availabilityStatus: 'active',
  sortOrder: 0,
  notes: '',
}

export function usesTable(reservation: Reservation, tableId: string) {
  return reservation.tableId === tableId || Boolean(reservation.secondaryTableIds?.includes(tableId))
}

export function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function toTableForm(table: RestaurantTable): TableFormState {
  return {
    code: table.code,
    floor: table.floor,
    area: table.area,
    capacity: table.capacity,
    availabilityStatus: table.availabilityStatus,
    sortOrder: table.sortOrder,
    notes: table.notes ?? '',
  }
}

export function StatusIcon({ status }: { status: TableAvailabilityStatus }) {
  if (status === 'active') return <CheckCircle2 className="size-3.5" />
  if (status === 'held_for_walk_in') return <ShieldAlert className="size-3.5" />
  return <EyeOff className="size-3.5" />
}
