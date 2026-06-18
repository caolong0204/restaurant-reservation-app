import { addDays, subDays } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

import { requireStaff } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Reservation, RestaurantTable, SlotAvailability } from '@/lib/reservation-types'
import { mapReservation, mapTable } from '@/lib/reservations/mappers'
import { fail, normalizeTime, ok } from '@/lib/reservations/shared'
import type { AdminSnapshot } from '@/lib/reservations/types'

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
  const today = new Date()
  const fromDate = formatInTimeZone(subDays(today, 7), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd')
  const toDate = formatInTimeZone(addDays(today, 30), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .gte('reservation_date', fromDate)
    .lte('reservation_date', toDate)
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

  const tables = await listSupabaseTables()
  if (!tables.ok) return fail(tables.error)

  const reservations = await listSupabaseReservations(tables.data)
  if (!reservations.ok) return fail(reservations.error)

  return ok({
    reservations: reservations.data,
    tables: tables.data,
  })
}

export async function getAvailableTables(
  date: string,
  time: string,
  partySize: number,
  excludingReservationId?: string,
): Promise<ActionResult<RestaurantTable[]>> {
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

  return ok(data.map(mapTable))
}

export async function getPublicSlotAvailability(
  date: string,
  partySize: number,
): Promise<ActionResult<SlotAvailability[]>> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(partySize) || partySize < 1) {
    return fail('Thông tin ngày hoặc số khách không hợp lệ.')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_slot_availability', {
    p_date: date,
    p_party_size: partySize,
  })

  if (error) {
    return fail('Không tải được tình trạng bàn trống.')
  }

  return ok(
    data.map((slot) => ({
      time: normalizeTime(slot.time),
      availableCount: slot.available_count,
    })),
  )
}
