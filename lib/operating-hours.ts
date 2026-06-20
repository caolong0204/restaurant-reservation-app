import type {
  ActionResult,
  OperatingHoursSnapshot,
  RestaurantDisplaySettings,
  RestaurantWeeklyHour,
} from '@/lib/reservation-types'
import { DEFAULT_WEEKLY_HOURS, formatOperatingHoursLabels } from '@/lib/restaurant'
import { fail, ok } from '@/lib/reservations/shared'
import { createClient } from '@/lib/supabase/server'

export function mapWeeklyHour(row: {
  weekday: number
  is_open: boolean
  open_time: string
  close_time: string
  last_booking_time: string
}): RestaurantWeeklyHour {
  return {
    weekday: row.weekday,
    isOpen: row.is_open,
    openTime: row.open_time.slice(0, 5),
    closeTime: row.close_time.slice(0, 5),
    lastBookingTime: row.last_booking_time.slice(0, 5),
  }
}

function mapDisplaySettings(row?: {
  show_closed_days_in_footer: boolean
} | null): RestaurantDisplaySettings {
  return {
    showClosedDaysInFooter: row?.show_closed_days_in_footer ?? false,
  }
}

export async function getOperatingHoursSnapshot(): Promise<ActionResult<OperatingHoursSnapshot>> {
  const supabase = await createClient()
  const [{ data: hours, error: hoursError }, { data: settings, error: settingsError }] =
    await Promise.all([
      supabase.from('restaurant_weekly_hours').select('*').order('weekday'),
      supabase.from('restaurant_display_settings').select('*').eq('id', 1).maybeSingle(),
    ])

  if (hoursError || settingsError) {
    return fail('Không tải được giờ hoạt động nhà hàng.')
  }

  const weeklyHours = hours?.length ? hours.map(mapWeeklyHour) : DEFAULT_WEEKLY_HOURS
  const displaySettings = mapDisplaySettings(settings)
  const snapshot: OperatingHoursSnapshot = {
    weeklyHours,
    displaySettings,
    footerLabels: formatOperatingHoursLabels(
      weeklyHours,
      displaySettings.showClosedDaysInFooter,
    ),
  }

  return ok(snapshot)
}
