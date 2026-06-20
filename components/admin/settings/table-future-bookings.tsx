import { CalendarClock, Phone, Users } from 'lucide-react'

import type { Reservation } from '@/lib/reservation-types'

export function TableFutureBookings({ reservations }: { reservations: Reservation[] }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm">
      <p className="text-xs font-bold uppercase text-amber-800">Booking tương lai đang dùng bàn này</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="rounded-md border border-amber-200 bg-card px-3 py-2 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-bold text-foreground">{reservation.name}</p>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                {reservation.status}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" />
                {reservation.date} {reservation.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {reservation.partySize}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" />
                {reservation.phone}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
