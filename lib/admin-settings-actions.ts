'use server'

import { formatInTimeZone } from 'date-fns-tz'
import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/guards'
import type {
  ActionResult,
  OperatingHoursSnapshot,
  RestaurantDisplaySettings,
  RestaurantTable,
  RestaurantTableInput,
  RestaurantWeeklyHour,
  TableAvailabilityStatus,
} from '@/lib/reservation-types'
import {
  formatOperatingHoursLabelsBilingual,
  minutesFromTimeString,
} from '@/lib/restaurant'
import { mapTable } from '@/lib/reservations/mappers'
import { fail, ok } from '@/lib/reservations/shared'
import { createClient } from '@/lib/supabase/server'

const TABLE_FLOORS = new Set(['Tầng 1', 'Tầng 2'])
const BLOCKING_STATUSES = ['confirmed', 'arrived', 'seated', 'completed'] as const
const ACTIVE_RESERVATION_STATUSES = ['pending', 'confirmed', 'arrived', 'seated'] as const

type TableConflictRow = {
  id: string
  guest_name: string
  reservation_date: string
  reservation_time: string
  table_id: string | null
  secondary_table_ids: string | null
  status: string
}

type OperatingHoursInput = {
  weeklyHours: RestaurantWeeklyHour[]
  displaySettings: RestaurantDisplaySettings
}

type FutureReservationRow = {
  id: string
  guest_name: string
  reservation_date: string
  reservation_time: string
  party_size: number
  status: string
}

function normalizeTableInput(input: RestaurantTableInput): RestaurantTableInput {
  return {
    code: input.code.trim(),
    floor: input.floor,
    area: input.area.trim(),
    capacity: Number(input.capacity),
    availabilityStatus: input.availabilityStatus,
    sortOrder: Number(input.sortOrder),
    notes: input.notes?.trim() || undefined,
  }
}

function validateTableInput(input: RestaurantTableInput): string | null {
  if (!input.code) return 'Vui lòng nhập tên bàn.'
  if (!TABLE_FLOORS.has(input.floor)) return 'Tầng không hợp lệ.'
  if (!input.area) return 'Vui lòng nhập khu vực.'
  if (!Number.isInteger(input.capacity) || input.capacity < 1 || input.capacity > 24) {
    return 'Sức chứa phải từ 1 đến 24 khách.'
  }
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
    return 'Thứ tự sắp xếp không hợp lệ.'
  }
  if (!['active', 'held_for_walk_in', 'inactive'].includes(input.availabilityStatus)) {
    return 'Trạng thái bàn không hợp lệ.'
  }
  return null
}

function rowUsesTable(row: TableConflictRow, tableId: string): boolean {
  if (row.table_id === tableId) return true
  return (row.secondary_table_ids ?? '').split(',').filter(Boolean).includes(tableId)
}

async function countFutureTableConflicts(tableId: string): Promise<ActionResult<number>> {
  const supabase = await createClient()
  const today = formatInTimeZone(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('reservations')
    .select('id, guest_name, reservation_date, reservation_time, table_id, secondary_table_ids, status')
    .gte('reservation_date', today)
    .in('status', BLOCKING_STATUSES)

  if (error) {
    return fail('Không kiểm tra được booking tương lai của bàn.')
  }

  return ok((data as TableConflictRow[]).filter((row) => rowUsesTable(row, tableId)).length)
}

function toDbStatus(status: TableAvailabilityStatus) {
  return {
    active: status === 'active',
    availability_status: status,
  }
}

export async function createRestaurantTable(
  input: RestaurantTableInput,
): Promise<ActionResult<RestaurantTable>> {
  const admin = await requireAdmin()
  if (!admin.ok) return fail(admin.error)

  const normalized = normalizeTableInput(input)
  const validationError = validateTableInput(normalized)
  if (validationError) return fail(validationError)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('restaurant_tables')
    .insert({
      code: normalized.code,
      floor: normalized.floor,
      area: normalized.area,
      capacity: normalized.capacity,
      sort_order: normalized.sortOrder,
      notes: normalized.notes ?? null,
      ...toDbStatus(normalized.availabilityStatus),
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') return fail('Tên bàn đã tồn tại.')
    return fail('Không tạo được bàn mới.')
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return ok(mapTable(data))
}

export async function updateRestaurantTable(
  id: string,
  input: RestaurantTableInput,
): Promise<ActionResult<RestaurantTable>> {
  const admin = await requireAdmin()
  if (!admin.ok) return fail(admin.error)

  const normalized = normalizeTableInput(input)
  const validationError = validateTableInput(normalized)
  if (validationError) return fail(validationError)

  const supabase = await createClient()
  const { data: current, error: currentError } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (currentError || !current) {
    return fail('Không tìm thấy bàn cần cập nhật.')
  }

  const currentStatus = current.availability_status ?? (current.active ? 'active' : 'inactive')
  if (currentStatus === 'active' && normalized.availabilityStatus !== 'active') {
    const conflicts = await countFutureTableConflicts(id)
    if (!conflicts.ok) return fail(conflicts.error)
    if (conflicts.data > 0) {
      return fail(
        `Bàn này đang được gán cho ${conflicts.data} booking trong tương lai. Vui lòng đổi bàn hoặc xử lý các booking đó trước khi tắt/giữ bàn.`,
      )
    }
  }

  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({
      code: normalized.code,
      floor: normalized.floor,
      area: normalized.area,
      capacity: normalized.capacity,
      sort_order: normalized.sortOrder,
      notes: normalized.notes ?? null,
      ...toDbStatus(normalized.availabilityStatus),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') return fail('Tên bàn đã tồn tại.')
    return fail('Không cập nhật được thông tin bàn.')
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return ok(mapTable(data))
}

function normalizeTimeValue(time: string) {
  return time.slice(0, 5)
}

function validateWeeklyHours(hours: RestaurantWeeklyHour[]): string | null {
  if (hours.length !== 7) return 'Vui lòng cấu hình đủ 7 ngày trong tuần.'
  const weekdays = new Set(hours.map((hour) => hour.weekday))
  if (weekdays.size !== 7 || [...weekdays].some((day) => day < 1 || day > 7)) {
    return 'Ngày trong tuần không hợp lệ.'
  }

  for (const hour of hours) {
    const open = minutesFromTimeString(hour.openTime)
    const close = minutesFromTimeString(hour.closeTime)
    const last = minutesFromTimeString(hour.lastBookingTime)
    const minuteValues = [hour.openTime, hour.closeTime, hour.lastBookingTime].map((time) =>
      Number(time.slice(3, 5)),
    )
    if (minuteValues.some((minute) => ![0, 15, 30, 45].includes(minute))) {
      return 'Các mốc giờ phải nằm trên bước 15 phút.'
    }
    if (hour.isOpen && open >= close) return 'Giờ mở cửa phải trước giờ đóng cửa.'
    if (hour.isOpen && last < open) return 'Giờ nhận khách cuối phải sau giờ mở cửa.'
    if (hour.isOpen && last > close) return 'Giờ nhận khách cuối không được sau giờ đóng cửa.'
  }

  return null
}

function isReservationValidForSchedule(row: FutureReservationRow, hours: RestaurantWeeklyHour[]) {
  const jsDay = new Date(`${row.reservation_date}T00:00:00`).getDay()
  const weekday = jsDay === 0 ? 7 : jsDay
  const schedule = hours.find((hour) => hour.weekday === weekday)
  if (!schedule?.isOpen) return false

  const reservationMinutes = minutesFromTimeString(normalizeTimeValue(row.reservation_time))
  return (
    reservationMinutes >= minutesFromTimeString(schedule.openTime) &&
    reservationMinutes <= minutesFromTimeString(schedule.lastBookingTime)
  )
}

export async function updateOperatingHoursSettings(
  input: OperatingHoursInput,
): Promise<ActionResult<OperatingHoursSnapshot>> {
  const admin = await requireAdmin()
  if (!admin.ok) return fail(admin.error)

  const weeklyHours = input.weeklyHours
    .map((hour) => ({
      weekday: Number(hour.weekday),
      isOpen: Boolean(hour.isOpen),
      openTime: normalizeTimeValue(hour.openTime),
      closeTime: normalizeTimeValue(hour.closeTime),
      lastBookingTime: normalizeTimeValue(hour.lastBookingTime),
    }))
    .sort((a, b) => a.weekday - b.weekday)

  const validationError = validateWeeklyHours(weeklyHours)
  if (validationError) return fail(validationError)

  const supabase = await createClient()
  const today = formatInTimeZone(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd')
  const { data: futureReservations, error: futureError } = await supabase
    .from('reservations')
    .select('id, guest_name, reservation_date, reservation_time, party_size, status')
    .gte('reservation_date', today)
    .in('status', ACTIVE_RESERVATION_STATUSES)

  if (futureError) return fail('Không kiểm tra được booking tương lai theo giờ hoạt động mới.')

  const invalidReservations = (futureReservations as FutureReservationRow[]).filter(
    (reservation) => !isReservationValidForSchedule(reservation, weeklyHours),
  )
  if (invalidReservations.length > 0) {
    const examples = invalidReservations
      .slice(0, 3)
      .map((item) => `${item.guest_name} ${item.reservation_date} ${normalizeTimeValue(item.reservation_time)}`)
      .join(', ')
    return fail(
      `Lịch mới làm ${invalidReservations.length} booking tương lai không hợp lệ: ${examples}. Vui lòng xử lý booking trước khi lưu.`,
    )
  }

  const { error: hoursError } = await supabase.from('restaurant_weekly_hours').upsert(
    weeklyHours.map((hour) => ({
      weekday: hour.weekday,
      is_open: hour.isOpen,
      open_time: hour.openTime,
      close_time: hour.closeTime,
      last_booking_time: hour.lastBookingTime,
    })),
    { onConflict: 'weekday' },
  )
  if (hoursError) return fail('Không lưu được giờ hoạt động.')

  const displaySettings = {
    showClosedDaysInFooter: Boolean(input.displaySettings.showClosedDaysInFooter),
  }
  const { error: displayError } = await supabase
    .from('restaurant_display_settings')
    .upsert(
      {
        id: 1,
        show_closed_days_in_footer: displaySettings.showClosedDaysInFooter,
      },
      { onConflict: 'id' },
    )
  if (displayError) return fail('Không lưu được tùy chọn hiển thị footer.')

  revalidatePath('/admin')
  revalidatePath('/')
  return ok({
    weeklyHours,
    displaySettings,
    footerLabels: formatOperatingHoursLabelsBilingual(
      weeklyHours,
      displaySettings.showClosedDaysInFooter,
    ),
  })
}

export async function deleteRestaurantTable(
  id: string,
): Promise<ActionResult<void>> {
  const admin = await requireAdmin()
  if (!admin.ok) return fail(admin.error)

  const supabase = await createClient()

  // Verify it exists
  const { data: current, error: currentError } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (currentError || !current) {
    return fail('Không tìm thấy bàn cần xóa.')
  }

  // Attempt to delete
  const { error } = await supabase
    .from('restaurant_tables')
    .delete()
    .eq('id', id)

  if (error) {
    // 23503 is foreign_key_violation
    if (error.code === '23503') {
      return fail('Không thể xóa bàn này vì đã có dữ liệu đặt bàn liên quan. Vui lòng tạm khóa thay vì xóa.')
    }
    return fail('Không thể xóa bàn: ' + error.message)
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return ok(undefined)
}
