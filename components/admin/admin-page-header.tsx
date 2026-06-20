import { AdminNotifications } from '@/components/admin/admin-notifications'
import type { Reservation } from '@/lib/reservation-types'

export function AdminPageHeader({
  title,
  description,
  reservations,
}: {
  title: string
  description: string
  reservations: Reservation[]
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <h1 className="text-balance font-serif text-2xl font-bold text-foreground">{title}</h1>
        <AdminNotifications reservations={reservations} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
