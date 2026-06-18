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
    <tr className="border-b border-border hover:bg-transparent">
      <td className="sticky left-0 z-20 h-16 border-r border-border bg-card text-center font-bold text-foreground">
        <div className="leading-none">
          {table.code}({table.floor === 'Tầng 1' ? 'T1' : 'T2'})
        </div>
        <div className="mt-1 text-xs font-medium leading-none text-muted-foreground">
          {table.capacity} ghế
        </div>
      </td>
      <td className="h-16 p-0">
        <div
          className="grid h-16 bg-background"
          style={{ gridTemplateColumns, width: timelineWidth }}
        >
          {slots.map((slot, index) => (
            <div
              key={`${table.id}-${slot}`}
              style={{ gridColumn: index + 1 }}
              className={cn(
                'row-start-1 border-r',
                (minutesFromTime(slot) + 30) % 60 === 0 ? 'border-foreground/20' : 'border-border/40',
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
                  'z-10 mx-0.5 my-3 flex h-10 items-center justify-between gap-2 rounded-sm border px-2 text-left text-xs font-bold shadow-sm ring-1 ring-black/5 transition-transform hover:-translate-y-0.5',
                  getBarClass(reservation),
                  isSecondary && 'border-dashed border-primary bg-teal-700/35 text-white/90 opacity-65',
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
