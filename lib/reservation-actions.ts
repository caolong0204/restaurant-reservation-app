'use server'

import { revalidatePath } from 'next/cache'

import type { Database } from '@/lib/database.types'
import { TIME_SLOTS, isPastTimeSlot } from '@/lib/restaurant'
import {
  createDemoReservation,
  deleteDemoReservation,
  getDemoAvailableTables,
  getDemoSlotAvailability,
  listDemoReservations,
  listDemoTables,
  updateDemoReservation,
} from '@/lib/reservation-demo-store'
import {
  type ActionResult,
  type Reservation,
  type ReservationInput,
  type ReservationStatus,
  type RestaurantTable,
  type SlotAvailability,
} from '@/lib/reservation-types'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { validateVNPhone } from '@/lib/utils'

type ReservationRow = Database['public']['Tables']['reservations']['Row']
type RestaurantTableRow = Database['public']['Tables']['restaurant_tables']['Row']

type AdminSnapshot = {
  reservations: Reservation[]
  tables: RestaurantTable[]
  authMode: 'supabase' | 'demo'
}

function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

function fail<T>(error: string): ActionResult<T> {
  return { ok: false, error }
}

function dateFromTimestamp(value: string): number {
  return new Date(value).getTime()
}

function normalizeTime(value: string): string {
  return value.slice(0, 5)
}

function mapTable(row: RestaurantTableRow): RestaurantTable {
  return {
    id: row.id,
    code: row.code,
    floor: row.floor === 'Tầng 2' ? 'Tầng 2' : 'Tầng 1',
    area: row.area,
    capacity: row.capacity,
    active: row.active,
    sortOrder: row.sort_order,
    notes: row.notes ?? undefined,
  }
}

function mapReservation(row: ReservationRow, tables: RestaurantTable[]): Reservation {
  const table = row.table_id ? tables.find((item) => item.id === row.table_id) : undefined
  const secondaryTableIds = row.secondary_table_ids ? row.secondary_table_ids.split(',').filter(Boolean) : []
  const secondaryTables = secondaryTableIds
    .map((id) => tables.find((item) => item.id === id))
    .filter((t): t is RestaurantTable => !!t)

  return {
    id: row.id,
    name: row.guest_name,
    phone: row.guest_phone,
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
  }
}

function normalizeInput(input: ReservationInput): ReservationInput {
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

function getSelectedCapacity(
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

function validateAssignmentCapacity(
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

function validateReservationInput(input: ReservationInput): string | null {
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

async function requireStaff(): Promise<ActionResult<true>> {
  if (!isSupabaseConfigured()) {
    return ok(true)
  }

  const supabase = await createClient()
  const { data: claims, error: claimsError } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub

  if (claimsError || !userId) {
    return fail('Bạn cần đăng nhập để quản lý đặt bàn.')
  }

  const { data, error } = await supabase
    .from('staff_profiles')
    .select('active')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data?.active) {
    return fail('Tài khoản không có quyền truy cập trang quản trị.')
  }

  return ok(true)
}

async function listSupabaseTables(): Promise<ActionResult<RestaurantTable[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return fail('Không tải được danh sách bàn.')
  }

  return ok(data.map(mapTable))
}

async function listSupabaseReservations(tables: RestaurantTable[]): Promise<ActionResult<Reservation[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('reservation_date', { ascending: true })
    .order('reservation_time', { ascending: true })

  if (error) {
    return fail('Không tải được danh sách đặt bàn.')
  }

  return ok(data.map((row) => mapReservation(row, tables)))
}

export async function getAdminSnapshot(): Promise<ActionResult<AdminSnapshot>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  if (!isSupabaseConfigured()) {
    return ok({
      reservations: listDemoReservations(),
      tables: listDemoTables(),
      authMode: 'demo',
    })
  }

  const tables = await listSupabaseTables()
  if (!tables.ok) return fail(tables.error)

  const reservations = await listSupabaseReservations(tables.data)
  if (!reservations.ok) return fail(reservations.error)

  return ok({
    reservations: reservations.data,
    tables: tables.data,
    authMode: 'supabase',
  })
}

export async function createReservation(input: ReservationInput): Promise<ActionResult<Reservation>> {
  const normalized = normalizeInput(input)
  const validationError = validateReservationInput(normalized)
  if (validationError) return fail(validationError)

  const availableSlots = await getPublicSlotAvailability(normalized.date, normalized.partySize)
  if (availableSlots.ok) {
    const matchingSlot = availableSlots.data.find((slot) => slot.time === normalized.time)
    if (matchingSlot && matchingSlot.availableCount < 1) {
      return fail('Khung giờ này đã hết bàn phù hợp. Vui lòng chọn giờ khác.')
    }
  }

  if (!isSupabaseConfigured()) {
    const reservation = createDemoReservation(normalized)
    revalidatePath('/admin')
    return ok(reservation)
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

  if (!isSupabaseConfigured()) {
    if (targetTableId) {
      const availableTables = getDemoAvailableTables(normalized.date, normalized.time, normalized.partySize)

      if (!availableTables.some((table) => table.id === targetTableId)) {
        return fail('Bàn chính được chọn không còn trống trong khung giờ đã chọn.')
      }

      for (const secondaryId of targetSecondaryTableIds) {
        if (!availableTables.some((table) => table.id === secondaryId)) {
          return fail('Một trong các bàn phụ được chọn không còn trống trong khung giờ đã chọn.')
        }
      }

      const capacityError = validateAssignmentCapacity(
        targetTableId,
        targetSecondaryTableIds,
        normalized.partySize,
        targetManualArrangement,
        listDemoTables(),
      )
      if (capacityError) return fail(capacityError)
    } else {
      const availableSlots = getDemoSlotAvailability(normalized.date, normalized.partySize)
      const matchingSlot = availableSlots.find((slot) => slot.time === normalized.time)
      if (matchingSlot && matchingSlot.availableCount < 1) {
        return fail('Khung giờ này đã hết bàn phù hợp. Vui lòng chọn giờ khác.')
      }
    }

    const reservation = createDemoReservation(
      {
        ...normalized,
        manualArrangement: targetManualArrangement,
        tableId: targetTableId ?? undefined,
        secondaryTableIds: targetSecondaryTableIds,
        status: targetStatus,
      },
      targetStatus,
    )
    revalidatePath('/admin')
    return ok(reservation)
  }

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
      if (matchingSlot && matchingSlot.availableCount < 1) {
        return fail('Khung giờ này đã hết bàn phù hợp. Vui lòng chọn giờ khác.')
      }
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
  const validationError = validateReservationInput(normalized)
  if (validationError) return fail(validationError)

  if (!isSupabaseConfigured()) {
    const current = listDemoReservations().find((reservation) => reservation.id === id)
    if (!current) return fail('Không tìm thấy lượt đặt bàn.')

    const targetTableId = input.tableId === '' ? null : (input.tableId ?? current.tableId ?? null)
    const targetSecondaryTableIds = targetTableId === null ? [] : (input.secondaryTableIds ?? current.secondaryTableIds ?? [])
    const targetManualArrangement = targetTableId === null ? false : Boolean(input.manualArrangement)
    let newStatus = current.status
    if (targetTableId === null) {
      if (current.status === 'confirmed') {
        newStatus = 'pending'
      }
    } else {
      newStatus = 'confirmed'
    }

    if (targetTableId) {
      const available = getDemoAvailableTables(normalized.date, normalized.time, normalized.partySize, id)
      const stillAvailable = available.some((table) => table.id === targetTableId)
      if (!stillAvailable) {
        return fail('Bàn chính được chọn không còn trống trong khung giờ đã chọn.')
      }
      for (const secId of targetSecondaryTableIds) {
        if (!available.some((table) => table.id === secId)) {
          return fail('Một trong các bàn phụ được chọn không còn trống trong khung giờ đã chọn.')
        }
      }

      const capacityError = validateAssignmentCapacity(
        targetTableId,
        targetSecondaryTableIds,
        normalized.partySize,
        targetManualArrangement,
        listDemoTables(),
      )
      if (capacityError) return fail(capacityError)
    }

    const reservation = updateDemoReservation(id, {
      ...normalized,
      manualArrangement: targetManualArrangement,
      tableId: targetTableId ?? undefined,
      secondaryTableIds: targetSecondaryTableIds,
      status: newStatus,
    })
    if (!reservation) return fail('Không tìm thấy lượt đặt bàn.')
    revalidatePath('/admin')
    return ok(reservation)
  }

  const snapshot = await getAdminSnapshot()
  if (!snapshot.ok) return fail(snapshot.error)
  const current = snapshot.data.reservations.find((reservation) => reservation.id === id)

  if (!current) {
    return fail('Không tìm thấy lượt đặt bàn.')
  }

  const targetTableId = input.tableId === '' ? null : (input.tableId ?? current.tableId ?? null)
  const targetSecondaryTableIds = targetTableId === null ? [] : (input.secondaryTableIds ?? current.secondaryTableIds ?? [])
  const targetManualArrangement = targetTableId === null ? false : Boolean(input.manualArrangement)
  let newStatus = current.status
  if (targetTableId === null) {
    if (current.status === 'confirmed') {
      newStatus = 'pending'
    }
  } else {
    newStatus = 'confirmed'
  }

  if (targetTableId) {
    const availableTables = await getAvailableTables(normalized.date, normalized.time, normalized.partySize, id)
    if (!availableTables.ok) return fail(availableTables.error)

    if (!availableTables.data.some((table) => table.id === targetTableId)) {
      return fail('Bàn chính được chọn không còn trống trong khung giờ đã chọn.')
    }
    for (const secId of targetSecondaryTableIds) {
      if (!availableTables.data.some((table) => table.id === secId)) {
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
  const table = targetTableId ? snapshot.data.tables.find((t) => t.id === targetTableId) : undefined
  const secondaryTables = targetSecondaryTableIds.map(sid => snapshot.data.tables.find((item) => item.id === sid)).filter((t): t is RestaurantTable => !!t)

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

  if (!isSupabaseConfigured()) {
    const reservation = updateDemoReservation(id, {
      status: 'cancelled',
      manualArrangement: false,
      tableId: undefined,
      secondaryTableIds: undefined,
    })
    if (!reservation) return fail('Không tìm thấy lượt đặt bàn.')
    revalidatePath('/admin')
    return ok(reservation)
  }

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

  const snapshot = await getAdminSnapshot()
  if (!snapshot.ok) return fail(snapshot.error)

  const reservation = snapshot.data.reservations.find((item) => item.id === id)
  if (!reservation) return fail('Không tìm thấy lượt đặt bàn.')

  revalidatePath('/admin')
  return ok(reservation)
}

export async function deleteReservation(id: string): Promise<ActionResult<string>> {
  const staff = await requireStaff()
  if (!staff.ok) return fail(staff.error)

  if (!isSupabaseConfigured()) {
    if (!deleteDemoReservation(id)) return fail('Không tìm thấy lượt đặt bàn.')
    revalidatePath('/admin')
    return ok(id)
  }

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

  if (!isSupabaseConfigured()) {
    const current = listDemoReservations().find((reservation) => reservation.id === id)
    if (!current) return fail('Không tìm thấy lượt đặt bàn.')

    const available = getDemoAvailableTables(current.date, current.time, current.partySize, id)
    if (!available.some((table) => table.id === tableId)) {
      return fail('Bàn chính không còn trống trong khung giờ đã chọn.')
    }
    for (const secId of secondaryTableIds) {
      if (!available.some((table) => table.id === secId)) {
        return fail('Một trong các bàn phụ được chọn không còn trống trong khung giờ đã chọn.')
      }
    }

    const capacityError = validateAssignmentCapacity(
      tableId,
      secondaryTableIds,
      current.partySize,
      manualArrangement,
      listDemoTables(),
    )
    if (capacityError) return fail(capacityError)

    const reservation = updateDemoReservation(id, {
      status: 'confirmed',
      manualArrangement,
      tableId,
      secondaryTableIds,
    })
    if (!reservation) return fail('Không tìm thấy lượt đặt bàn.')
    revalidatePath('/admin')
    return ok(reservation)
  }

  const snapshot = await getAdminSnapshot()
  if (!snapshot.ok) return fail(snapshot.error)

  const current = snapshot.data.reservations.find((reservation) => reservation.id === id)
  if (!current) return fail('Không tìm thấy lượt đặt bàn.')

  const availableTables = await getAvailableTables(current.date, current.time, current.partySize, id)
  if (!availableTables.ok) return fail(availableTables.error)

  if (!availableTables.data.some((table) => table.id === tableId)) {
    return fail('Bàn chính không còn trống trong khung giờ đã chọn.')
  }
  for (const secId of secondaryTableIds) {
    if (!availableTables.data.some((table) => table.id === secId)) {
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
      updated_at: timestamp
    })
    .eq('id', id)

  if (error) {
    return fail('Không xác nhận được đặt bàn. Bàn có thể vừa bị gán cho lượt khác.')
  }

  const table = snapshot.data.tables.find((item) => item.id === tableId)
  const secondaryTables = secondaryTableIds.map(sid => snapshot.data.tables.find((item) => item.id === sid)).filter((t): t is RestaurantTable => !!t)

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

export async function getAvailableTables(
  date: string,
  time: string,
  partySize: number,
  excludingReservationId?: string,
): Promise<ActionResult<RestaurantTable[]>> {
  if (!isSupabaseConfigured()) {
    return ok(getDemoAvailableTables(date, time, partySize, excludingReservationId))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_available_tables', {
    p_date: date,
    p_time: normalizeTime(time),
    p_party_size: partySize,
    p_excluding_reservation_id: excludingReservationId,
  })

  if (error) {
    return fail('Không tải được danh sách bàn trống.')
  }

  return ok(data.map((row) => ({
    id: row.id,
    code: row.code,
    floor: row.floor === 'Tầng 2' ? 'Tầng 2' : 'Tầng 1',
    area: row.area,
    capacity: row.capacity,
    active: row.active,
    sortOrder: row.sort_order,
    notes: row.notes ?? undefined,
  })))
}

export async function getPublicSlotAvailability(
  date: string,
  partySize: number,
): Promise<ActionResult<SlotAvailability[]>> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(partySize) || partySize < 1) {
    return fail('Thông tin ngày hoặc số khách không hợp lệ.')
  }

  if (!isSupabaseConfigured()) {
    return ok(getDemoSlotAvailability(date, partySize))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_slot_availability', {
    p_date: date,
    p_party_size: partySize,
  })

  if (error) {
    return fail('Không tải được tình trạng bàn trống.')
  }

  return ok(data.map((slot) => ({
    time: normalizeTime(slot.time),
    availableCount: slot.available_count,
  })))
}
