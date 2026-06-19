import { revalidatePath } from 'next/cache'

import { requireStaff } from '@/lib/auth/guards'
import { isReservationInServiceWindow } from '@/lib/admin-calendar'
import { createClient } from '@/lib/supabase/server'
import type {
  ActionResult,
  Reservation,
  ReservationInput,
  ReservationStatus,
  RestaurantTable,
} from '@/lib/reservation-types'
import { getAdminSnapshot, getAvailableTables, getPublicSlotAvailability } from '@/lib/reservations/queries'
import { dateFromTimestamp, fail, ok } from '@/lib/reservations/shared'
import {
  normalizeInput,
  validateAssignmentCapacity,
  validateReservationInput,
} from '@/lib/reservations/validators'

export async function createReservation(input: ReservationInput): Promise<ActionResult<Reservation>> {
  const normalized = normalizeInput(input)
  const validationError = validateReservationInput(normalized)
  if (validationError) return fail(validationError)

  const availableSlots = await getPublicSlotAvailability(normalized.date, normalized.partySize)
  if (availableSlots.ok) {
    const matchingSlot = availableSlots.data.find((slot) => slot.time === normalized.time)
    void matchingSlot
  }

  const supabase = await createClient()
  const id = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  const { error } = await supabase.from('reservations').insert({
    id,
    guest_name: normalized.name,
    guest_phone: normalized.phone,
    reservation_date: normalized.date,
    reservation_time: normalized.time,
    party_size: normalized.partySize,
    occasion: normalized.occasion ?? null,
    requested_area: normalized.tableLocation ?? null,
    notes: normalized.notes ?? null,
    status: 'pending',
    manual_arrangement: false,
    table_id: null,
    secondary_table_ids: null,
    created_at: timestamp,
    updated_at: timestamp,
  })

  if (error) {
    return fail('Chưa gửi được yêu cầu đặt bàn. Vui lòng thử lại.')
  }

  revalidatePath('/admin')

  return ok({
    ...normalized,
    id,
    status: 'pending',
    manualArrangement: false,
    secondaryTableIds: [],
    secondaryTables: [],
    createdAt: dateFromTimestamp(timestamp),
    updatedAt: dateFromTimestamp(timestamp),
  })
}

export async function createManualReservation(input: ReservationInput): Promise<ActionResult<Reservation>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  const normalized = normalizeInput(input)
  const validationError = validateReservationInput(normalized)
  if (validationError) return fail(validationError)

  const targetTableId = normalized.tableId?.trim() ? normalized.tableId : null
  const targetSecondaryTableIds = targetTableId ? (normalized.secondaryTableIds ?? []) : []
  const targetManualArrangement = targetTableId ? Boolean(normalized.manualArrangement) : false
  const targetStatus: ReservationStatus = targetTableId ? 'confirmed' : 'pending'

  if (targetTableId) {
    const availableTables = await getAvailableTables(
      normalized.date,
      normalized.time,
      normalized.partySize,
    )
    if (!availableTables.ok) return fail(availableTables.error)

    if (!availableTables.data.some((table) => table.id === targetTableId)) {
      return fail('Bàn chính được chọn không còn trống trong khung giờ đã chọn.')
    }

    for (const secondaryId of targetSecondaryTableIds) {
      if (!availableTables.data.some((table) => table.id === secondaryId)) {
        return fail('Một trong các bàn phụ được chọn không còn trống trong khung giờ đã chọn.')
      }
    }

    const snapshot = await getAdminSnapshot()
    if (!snapshot.ok) return fail(snapshot.error)

    const capacityError = validateAssignmentCapacity(
      targetTableId,
      targetSecondaryTableIds,
      normalized.partySize,
      targetManualArrangement,
      snapshot.data.tables,
    )
    if (capacityError) return fail(capacityError)
  } else {
    const availableSlots = await getPublicSlotAvailability(normalized.date, normalized.partySize)
    if (availableSlots.ok) {
      const matchingSlot = availableSlots.data.find((slot) => slot.time === normalized.time)
      void matchingSlot
    }
  }

  const supabase = await createClient()
  const id = crypto.randomUUID()
  const timestamp = new Date().toISOString()
  const secondaryTableIdsStr = targetSecondaryTableIds.length > 0 ? targetSecondaryTableIds.join(',') : null

  const { error } = await supabase.from('reservations').insert({
    id,
    guest_name: normalized.name,
    guest_phone: normalized.phone,
    reservation_date: normalized.date,
    reservation_time: normalized.time,
    party_size: normalized.partySize,
    occasion: normalized.occasion ?? null,
    requested_area: normalized.tableLocation ?? null,
    notes: normalized.notes ?? null,
    status: targetStatus,
    manual_arrangement: targetManualArrangement,
    table_id: targetTableId,
    secondary_table_ids: secondaryTableIdsStr,
    created_at: timestamp,
    updated_at: timestamp,
  })

  if (error) {
    return fail(
      targetTableId
        ? 'Không tạo được đặt bàn với bàn đã chọn. Bàn có thể vừa bị giữ bởi lượt khác.'
        : 'Không thêm được đặt bàn. Vui lòng thử lại.',
    )
  }

  revalidatePath('/admin')

  const snapshot = await getAdminSnapshot()
  if (snapshot.ok) {
    const createdReservation = snapshot.data.reservations.find((reservation) => reservation.id === id)
    if (createdReservation) return ok(createdReservation)
  }

  return ok({
    id,
    name: normalized.name,
    phone: normalized.phone,
    date: normalized.date,
    time: normalized.time,
    partySize: normalized.partySize,
    occasion: normalized.occasion,
    tableLocation: normalized.tableLocation,
    notes: normalized.notes,
    status: targetStatus,
    manualArrangement: targetManualArrangement,
    tableId: targetTableId ?? undefined,
    secondaryTableIds: targetSecondaryTableIds,
    secondaryTables: [],
    createdAt: dateFromTimestamp(timestamp),
    updatedAt: dateFromTimestamp(timestamp),
  })
}

export async function editReservation(id: string, input: ReservationInput): Promise<ActionResult<Reservation>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  const normalized = normalizeInput(input)

  const snapshot = await getAdminSnapshot()
  if (!snapshot.ok) return fail(snapshot.error)
  const current = snapshot.data.reservations.find((reservation) => reservation.id === id)

  if (!current) {
    return fail('Không tìm thấy lượt đặt bàn.')
  }

  const targetTableId = input.tableId === '' ? null : (input.tableId ?? current.tableId ?? null)
  const targetSecondaryTableIds =
    targetTableId === null ? [] : (input.secondaryTableIds ?? current.secondaryTableIds ?? [])
  const targetManualArrangement =
    targetTableId === null ? false : Boolean(input.manualArrangement ?? current.manualArrangement)
  const isWithinServiceWindow = isReservationInServiceWindow(current)

  const validationError = validateReservationInput(normalized, { allowPastTime: isWithinServiceWindow })
  if (validationError) return fail(validationError)

  let newStatus = current.status
  if (targetTableId === null) {
    if (current.status !== 'pending') {
      newStatus = 'pending'
    }
  } else {
    if (current.status === 'pending') {
      newStatus = 'confirmed'
    }
  }

  if (targetTableId) {
    const availableTables = await getAvailableTables(normalized.date, normalized.time, normalized.partySize, id)
    if (!availableTables.ok) return fail(availableTables.error)

    if (!availableTables.data.some((table) => table.id === targetTableId)) {
      return fail('Bàn chính được chọn không còn trống trong khung giờ đã chọn.')
    }
    for (const secondaryId of targetSecondaryTableIds) {
      if (!availableTables.data.some((table) => table.id === secondaryId)) {
        return fail('Một trong các bàn phụ được chọn không còn trống trong khung giờ đã chọn.')
      }
    }

    const capacityError = validateAssignmentCapacity(
      targetTableId,
      targetSecondaryTableIds,
      normalized.partySize,
      targetManualArrangement,
      snapshot.data.tables,
    )
    if (capacityError) return fail(capacityError)
  }

  const supabase = await createClient()
  const timestamp = new Date().toISOString()
  const secondaryTableIdsStr = targetSecondaryTableIds.length > 0 ? targetSecondaryTableIds.join(',') : null

  const { error } = await supabase
    .from('reservations')
    .update({
      guest_name: normalized.name,
      guest_phone: normalized.phone,
      reservation_date: normalized.date,
      reservation_time: normalized.time,
      party_size: normalized.partySize,
      occasion: normalized.occasion ?? null,
      requested_area: normalized.tableLocation ?? null,
      notes: normalized.notes ?? null,
      manual_arrangement: targetManualArrangement,
      table_id: targetTableId,
      secondary_table_ids: secondaryTableIdsStr,
      status: newStatus,
      updated_at: timestamp,
    })
    .eq('id', id)

  if (error) {
    return fail('Không cập nhật được lượt đặt bàn.')
  }

  revalidatePath('/admin')
  const table = targetTableId ? snapshot.data.tables.find((item) => item.id === targetTableId) : undefined
  const secondaryTables = targetSecondaryTableIds
    .map((secondaryId) => snapshot.data.tables.find((item) => item.id === secondaryId))
    .filter((tableItem): tableItem is RestaurantTable => !!tableItem)

  return ok({
    ...current,
    ...normalized,
    manualArrangement: targetManualArrangement,
    tableId: targetTableId ?? undefined,
    table: table ?? undefined,
    secondaryTableIds: targetSecondaryTableIds,
    secondaryTables,
    status: newStatus,
    updatedAt: dateFromTimestamp(timestamp),
  })
}

export async function cancelReservation(id: string): Promise<ActionResult<Reservation>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  const snapshot = await getAdminSnapshot()
  if (!snapshot.ok) return fail(snapshot.error)

  const current = snapshot.data.reservations.find((item) => item.id === id)
  if (!current) return fail('Không tìm thấy lượt đặt bàn.')

  const supabase = await createClient()
  const timestamp = new Date().toISOString()
  const { error } = await supabase
    .from('reservations')
    .update({
      status: 'cancelled',
      manual_arrangement: false,
      table_id: null,
      secondary_table_ids: null,
      updated_at: timestamp,
    })
    .eq('id', id)

  if (error) {
    return fail('Không hủy được lượt đặt bàn.')
  }

  revalidatePath('/admin')
  return ok({
    ...current,
    status: 'cancelled',
    manualArrangement: false,
    tableId: undefined,
    table: undefined,
    secondaryTableIds: [],
    secondaryTables: [],
    updatedAt: dateFromTimestamp(timestamp),
  })
}

export async function deleteReservation(id: string): Promise<ActionResult<string>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  const snapshot = await getAdminSnapshot()
  if (!snapshot.ok) return fail(snapshot.error)

  const current = snapshot.data.reservations.find((reservation) => reservation.id === id)
  if (!current) return fail('Không tìm thấy lượt đặt bàn.')

  const supabase = await createClient()
  const { error } = await supabase.from('reservations').delete().eq('id', id)

  if (error) {
    return fail('Không xóa được lượt đặt bàn.')
  }

  revalidatePath('/admin')
  return ok(id)
}

export async function confirmReservation(
  id: string,
  tableId: string,
  secondaryTableIds: string[] = [],
  manualArrangement = false,
): Promise<ActionResult<Reservation>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  const snapshot = await getAdminSnapshot()
  if (!snapshot.ok) return fail(snapshot.error)

  const current = snapshot.data.reservations.find((reservation) => reservation.id === id)
  if (!current) return fail('Không tìm thấy lượt đặt bàn.')

  const availableTables = await getAvailableTables(current.date, current.time, current.partySize, id)
  if (!availableTables.ok) return fail(availableTables.error)

  if (!availableTables.data.some((table) => table.id === tableId)) {
    return fail('Bàn chính không còn trống trong khung giờ đã chọn.')
  }
  for (const secondaryId of secondaryTableIds) {
    if (!availableTables.data.some((table) => table.id === secondaryId)) {
      return fail('Một trong các bàn phụ được chọn không còn trống trong khung giờ đã chọn.')
    }
  }

  const capacityError = validateAssignmentCapacity(
    tableId,
    secondaryTableIds,
    current.partySize,
    manualArrangement,
    snapshot.data.tables,
  )
  if (capacityError) return fail(capacityError)

  const supabase = await createClient()
  const timestamp = new Date().toISOString()
  const secondaryTableIdsStr = secondaryTableIds.length > 0 ? secondaryTableIds.join(',') : null

  const { error } = await supabase
    .from('reservations')
    .update({
      status: 'confirmed',
      manual_arrangement: manualArrangement,
      table_id: tableId,
      secondary_table_ids: secondaryTableIdsStr,
      updated_at: timestamp,
    })
    .eq('id', id)

  if (error) {
    return fail('Không xác nhận được đặt bàn. Bàn có thể vừa bị gán cho lượt khác.')
  }

  const table = snapshot.data.tables.find((item) => item.id === tableId)
  const secondaryTables = secondaryTableIds
    .map((secondaryId) => snapshot.data.tables.find((item) => item.id === secondaryId))
    .filter((tableItem): tableItem is RestaurantTable => !!tableItem)

  revalidatePath('/admin')
  return ok({
    ...current,
    status: 'confirmed',
    manualArrangement,
    tableId,
    table,
    secondaryTableIds,
    secondaryTables,
    updatedAt: dateFromTimestamp(timestamp),
  })
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<ActionResult<Reservation>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  const snapshot = await getAdminSnapshot()
  if (!snapshot.ok) return fail(snapshot.error)

  const current = snapshot.data.reservations.find((reservation) => reservation.id === id)
  if (!current) return fail('Không tìm thấy lượt đặt bàn.')

  // If status requires a table, but we don't have one, we can't change to it
  const requiresTable = ['confirmed', 'arrived', 'seated', 'completed'].includes(status)
  if (requiresTable && !current.tableId) {
    return fail('Vui lòng gán bàn trước khi chuyển sang trạng thái này.')
  }

  // If status is completed, cancelled or no_show, we might want to free the table 
  // but keeping it assigned in the DB is fine as the sync function handles it,
  // or we could explicitly set table_id = null if you wanted, but usually we just keep it
  // for historical record. The sync_reservation_table_assignments trigger only creates 
  // assignments for active statuses.

  const supabase = await createClient()
  const timestamp = new Date().toISOString()

  const { error } = await supabase
    .from('reservations')
    .update({
      status,
      updated_at: timestamp,
    })
    .eq('id', id)

  if (error) {
    return fail(`Không thể cập nhật trạng thái. ${error.message}`)
  }

  revalidatePath('/admin')
  return ok({
    ...current,
    status,
    updatedAt: dateFromTimestamp(timestamp),
  })
}
