import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin-dashboard'
import { getStaffAccounts } from '@/lib/admin-account-actions'
import { getOperatingHoursSnapshot } from '@/lib/operating-hours'
import { getAdminSnapshot } from '@/lib/reservations/queries'
import { DEFAULT_WEEKLY_HOURS, formatOperatingHoursLabelsBilingual } from '@/lib/restaurant'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Staff Dashboard | Flambé',
  description: 'Manage reservations for Flambé.',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  let canManageSettings = false

  if (userId) {
    const { data } = await supabase
      .from('staff_profiles')
      .select('active, role')
      .eq('user_id', userId)
      .maybeSingle()

    canManageSettings = Boolean(data?.active && data.role === 'admin')
  }

  const [snapshot, operatingHours, staffAccounts] = await Promise.all([
    getAdminSnapshot(),
    getOperatingHoursSnapshot(),
    canManageSettings ? getStaffAccounts() : Promise.resolve({ ok: true as const, data: [] }),
  ])
  const hoursSnapshot = operatingHours.ok
    ? operatingHours.data
    : {
        weeklyHours: DEFAULT_WEEKLY_HOURS,
        displaySettings: { showClosedDaysInFooter: false },
        footerLabels: formatOperatingHoursLabelsBilingual(DEFAULT_WEEKLY_HOURS, false),
      }

  return (
    <AdminDashboard
      canManageSettings={canManageSettings}
      initialReservations={snapshot.ok ? snapshot.data.reservations : []}
      initialTables={snapshot.ok ? snapshot.data.tables : []}
      initialStaffAccounts={staffAccounts.ok ? staffAccounts.data : []}
      currentStaffUserId={userId}
      operatingHours={hoursSnapshot}
    />
  )
}
