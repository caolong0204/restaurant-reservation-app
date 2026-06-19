import { memo } from 'react'
import { Users } from 'lucide-react'

import type { Reservation, RestaurantTable } from '@/lib/reservation-types'
import { getBookingDurationMinutes } from '@/lib/reservation-types'
import {
  durationLabel,
  getBarClass,
  getReservationGridStyle,
  minutesFromTime,
  statusText,
} from '@/lib/admin-calendar'
import { cn } from '@/lib/utils'

export const TimelineRow = memo(function TimelineRow({
  table,
  tableReservations,
  slots,
  gridTemplateColumns,
  timelineWidth,
  onSelectReservation,
}: {
  table: RestaurantTable
  tableReservations: Reservation[]
  slots: string[]
  gridTemplateColumns: string
  timelineWidth: number
  onSelectReservation: (reservation: Reservation) => void
}) {
  return (
    <tr className="hover:bg-transparent">
      <td className="sticky left-0 z-40 h-14 w-32 min-w-32 border-b border-r border-border/80 bg-card text-left font-bold text-foreground shadow-[3px_0_6px_-4px_rgba(0,0,0,0.35)]">
        <div className="px-3 leading-none">
          {table.code}
        </div>
        <div className="mt-1 px-3 text-xs font-medium leading-none text-muted-foreground">
          {table.capacity} ghế · {table.floor === 'Tầng 1' ? 'T1' : 'T2'}
        </div>
      </td>
      <td className="h-14 p-0 border-b border-border/80">
        <div
          className="grid h-14 bg-background"
          style={{ gridTemplateColumns, width: timelineWidth }}
        >
          {slots.map((slot, index) => (
            <div
              key={`${table.id}-${slot}`}
              style={{ gridColumn: index + 1 }}
                className={cn(
                  'row-start-1 border-r',
                  (minutesFromTime(slot) + 30) % 60 === 0 ? 'border-foreground/15' : 'border-border/35',
                )}
              />
            ))}
          {tableReservations.map((reservation) => {
            const style = getReservationGridStyle(reservation, slots)
            if (!style) return null
            const isSecondary = reservation.tableId !== table.id

            return (
              <button
                key={reservation.id}
                type="button"
                onClick={() => onSelectReservation(reservation)}
                style={style}
                className={cn(
                  'z-10 mx-0.5 my-2 flex h-10 items-center justify-between gap-2 rounded-md border px-2 text-left text-xs font-bold shadow-xs transition-transform hover:-translate-y-0.5',
                  getBarClass(reservation),
                  isSecondary && 'border-dashed opacity-40',
                )}
                title={`${reservation.name} - ${statusText(reservation.status)}${isSecondary ? ' (Bàn phụ ghép thêm)' : ''}`}
              >
                <span className="min-w-0 truncate">
                  {isSecondary ? `[Ghép] ${reservation.name}` : reservation.name}
                  {reservation.phone && (
                    <span className="ml-1 font-medium opacity-75">({reservation.phone.slice(-3)})</span>
                  )}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded bg-black/10 px-1 py-0.5 text-[11px] leading-none">
                  <span className="inline-flex items-center gap-0.5">
                    <Users className="size-3" />
                    {reservation.partySize}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{durationLabel(getBookingDurationMinutes(reservation.partySize))}</span>
                </span>
              </button>
            )
          })}
        </div>
      </td>
    </tr>
  )
})
