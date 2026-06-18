import { TIME_SLOTS, isPastTimeSlot } from '@/lib/restaurant'
import type { ReservationInput, RestaurantTable } from '@/lib/reservation-types'
import { validateVNPhone } from '@/lib/utils'
import { normalizeTime } from '@/lib/reservations/shared'

export function normalizeInput(input: ReservationInput): ReservationInput {
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    date: input.date,
    time: normalizeTime(input.time),
    partySize: input.partySize,
    occasion: input.occasion?.trim() || undefined,
    tableLocation: input.tableLocation?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    manualArrangement: input.manualArrangement,
    tableId: input.tableId,
    secondaryTableIds: input.secondaryTableIds,
    status: input.status,
  }
}

export function getSelectedCapacity(
  tableId: string,
  secondaryTableIds: string[] | undefined,
  tables: RestaurantTable[],
): number {
  const mainTable = tables.find((table) => table.id === tableId)
  const secondaryCapacity = (secondaryTableIds ?? []).reduce((sum, secondaryId) => {
    const table = tables.find((item) => item.id === secondaryId)
    return sum + (table?.capacity ?? 0)
  }, 0)

  return (mainTable?.capacity ?? 0) + secondaryCapacity
}

export function validateAssignmentCapacity(
  tableId: string | null,
  secondaryTableIds: string[],
  partySize: number,
  manualArrangement: boolean,
  tables: RestaurantTable[],
): string | null {
  if (!tableId) return null

  const totalCapacity = getSelectedCapacity(tableId, secondaryTableIds, tables)
  if (totalCapacity < partySize && !manualArrangement) {
    return 'Tổng số ghế của các bàn đã chọn chưa đủ cho số lượng khách. Vui lòng ghép thêm bàn hoặc chọn tự sắp xếp thêm ghế / bàn phụ ngoài hệ thống.'
  }

  return null
}

export function validateReservationInput(input: ReservationInput): string | null {
  if (!input.name.trim()) return 'Vui lòng nhập tên khách.'
  if (!validateVNPhone(input.phone)) return 'Số điện thoại không hợp lệ.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return 'Ngày đặt bàn không hợp lệ.'
  if (!TIME_SLOTS.includes(normalizeTime(input.time))) return 'Khung giờ đặt bàn không hợp lệ.'
  if (isPastTimeSlot(normalizeTime(input.time), input.date)) {
    return 'Không thể đặt bàn vào khung giờ đã trôi qua.'
  }
  if (!Number.isInteger(input.partySize) || input.partySize < 1 || input.partySize > 24) {
    return 'Số lượng khách phải từ 1 đến 24.'
  }

  return null
}
