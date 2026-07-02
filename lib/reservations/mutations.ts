import { revalidatePath } from 'next/cache'

import { sendConfirmationEmail } from '@/lib/email/mailer'

import { requireStaff } from '@/lib/auth/guards'
import { isReservationInServiceWindow } from '@/lib/admin-calendar'
import { createClient } from '@/lib/supabase/server'
import type {
  ActionResult,
  ReservationEditInput,
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

function sendConfirmationEmailInBackground(reservation: Reservation) {
  void sendConfirmationEmail(reservation).then((result) => {
    if (!result.ok) {
      console.error('[email] Confirmation email failed after reservation update:', {
        reservationId: reservation.id,
        error: result.error,
      })
    }
  })
}

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
    guest_email: normalized.email ?? null,
    reservation_date: normalized.date,
    reservation_time: normalized.time,
    party_size: normalized.partySize,
    occasion: normalized.occasion ?? null,
    requested_area: normalized.tableLocation ?? null,
    notes: normalized.notes ?? null,
    locale: normalized.locale ?? 'vi',
    status: 'pending',
    manual_arrangement: false,
    table_id: null,
    secondary_table_ids: null,
    created_at: timestamp,
    updated_at: timestamp,
  })

  if (error) {
    console.error('Failed to create reservation:', error)
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
    locale: normalized.locale ?? 'vi',
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
    guest_email: normalized.email ?? null,
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
    if (createdReservation) {
      if (createdReservation.status === 'confirmed') sendConfirmationEmailInBackground(createdReservation)

      return {
        ok: true,
        data: createdReservation,
      }
    }
  }

  const createdReservation: Reservation = {
    id,
    name: normalized.name,
    phone: normalized.phone,
    email: normalized.email,
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
  }
  if (createdReservation.status === 'confirmed') sendConfirmationEmailInBackground(createdReservation)

  return {
    ok: true,
    data: createdReservation,
  }
}

export async function editReservation(id: string, input: ReservationEditInput): Promise<ActionResult<Reservation>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  const snapshot = await getAdminSnapshot()
  if (!snapshot.ok) return fail(snapshot.error)
  const current = snapshot.data.reservations.find((reservation) => reservation.id === id)

  if (!current) {
    return fail('Không tìm thấy lượt đặt bàn.')
  }

  const mergedInput: ReservationInput = {
    name: input.name ?? current.name,
    phone: input.phone ?? current.phone,
    email: 'email' in input ? input.email : current.email,
    date: input.date ?? current.date,
    time: input.time ?? current.time,
    partySize: input.partySize ?? current.partySize,
    occasion: 'occasion' in input ? input.occasion : current.occasion,
    tableLocation: 'tableLocation' in input ? input.tableLocation : current.tableLocation,
    notes: 'notes' in input ? input.notes : current.notes,
    manualArrangement: 'manualArrangement' in input ? input.manualArrangement : current.manualArrangement,
    tableId: 'tableId' in input ? input.tableId : current.tableId,
    secondaryTableIds: 'secondaryTableIds' in input ? input.secondaryTableIds : current.secondaryTableIds,
    status: input.status ?? current.status,
  }
  const normalized = normalizeInput(mergedInput)

  const targetTableId = input.tableId === '' ? null : (input.tableId ?? current.tableId ?? null)
  const targetSecondaryTableIds =
    targetTableId === null
      ? []
      : ('secondaryTableIds' in input ? input.secondaryTableIds ?? [] : current.secondaryTableIds ?? [])
  const targetManualArrangement =
    targetTableId === null
      ? false
      : Boolean('manualArrangement' in input ? input.manualArrangement : current.manualArrangement)
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
      guest_email: normalized.email ?? null,
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

  const updatedReservation: Reservation = {
    ...current,
    ...normalized,
    manualArrangement: targetManualArrangement,
    tableId: targetTableId ?? undefined,
    table: table ?? undefined,
    secondaryTableIds: targetSecondaryTableIds,
    secondaryTables,
    status: newStatus,
    updatedAt: dateFromTimestamp(timestamp),
  }
  if (
    updatedReservation.status === 'confirmed' &&
    (current.status !== 'confirmed' || current.email !== updatedReservation.email)
  ) {
    sendConfirmationEmailInBackground(updatedReservation)
  }

  return {
    ok: true,
    data: updatedReservation,
  }
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

  const confirmedReservation: Reservation = {
    ...current,
    status: 'confirmed',
    manualArrangement,
    tableId,
    table,
    secondaryTableIds,
    secondaryTables,
    updatedAt: dateFromTimestamp(timestamp),
  }

  // Send confirmation email — best-effort, does not block confirm flow
  sendConfirmationEmailInBackground(confirmedReservation)

  return {
    ok: true,
    data: confirmedReservation,
  }
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

  // confirmed, arrived, seated đều yêu cầu bàn đã được gán trước.
  // completed/cancelled/no_show không cần — trigger DB sẽ tự giải phóng bàn.
  const requiresTable = ['confirmed', 'arrived', 'seated'].includes(status)
  if (requiresTable && !current.tableId) {
    return fail('Vui lòng gán bàn trước khi chuyển sang trạng thái này.')
  }

  const supabase = await createClient()
  const timestamp = new Date().toISOString()

  const { error } = await supabase
    .from('reservations')
    .update({
      status,
      updated_at: timestamp,
      // Ghi lại thời điểm thực tế admin bấm "Hoàn thành" để vẽ bar calendar đúng độ dài
      ...(status === 'completed' ? { completed_at: timestamp } : {}),
    })
    .eq('id', id)

  if (error) {
    if (
      error.code === '23P01' ||
      error.message.includes('reservation_table_assignments_no_overlap') ||
      error.message.includes('exclusion constraint')
    ) {
      return fail('Không thể cập nhật trạng thái vì bàn đang bị trùng với một booking khác trong cùng khung giờ.')
    }

    return fail('Không thể cập nhật trạng thái. Vui lòng thử lại.')
  }

  revalidatePath('/admin')
  const updatedReservation: Reservation = {
    ...current,
    status,
    updatedAt: dateFromTimestamp(timestamp),
  }
  if (current.status !== 'confirmed' && updatedReservation.status === 'confirmed') {
    sendConfirmationEmailInBackground(updatedReservation)
  }

  return {
    ok: true,
    data: updatedReservation,
  }
}
