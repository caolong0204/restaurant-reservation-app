import { memo } from 'react'
import { Users } from 'lucide-react'

import type { Reservation, RestaurantTable } from '@/lib/reservation-types'
import { getBookingDurationMinutes } from '@/lib/reservation-types'
import {
  computeLanes,
  durationLabel,
  formatDurationMinutes,
  getBarClass,
  getEffectiveDurationMinutes,
  getReservationGridStyle,
  minutesFromTime,
  statusText,
} from '@/lib/admin-calendar'
import { cn } from '@/lib/utils'

const LANE_HEIGHT_PX = 56 // h-14 = 56px

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
  const { laneOf, laneCount } = computeLanes(tableReservations, slots)
  const rowHeight = laneCount * LANE_HEIGHT_PX
  const hasOverlap = laneCount > 1

  return (
    <tr className="hover:bg-transparent">
      <td
        className="sticky left-0 z-40 border-b border-r border-border/80 bg-card text-left font-bold text-foreground shadow-[3px_0_6px_-4px_rgba(0,0,0,0.35)]"
        style={{ height: rowHeight, minWidth: 128, width: 128 }}
      >
        <div className="flex flex-col justify-center h-full px-3 gap-1">
          <div className="flex items-center gap-1.5 leading-none">
            {table.code}
            {hasOverlap && (
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-500/30">
                {laneCount}
              </span>
            )}
          </div>
          <div className="text-xs font-medium leading-none text-muted-foreground">
            {table.capacity} ghế · {table.floor === 'Tầng 1' ? 'T1' : 'T2'}
          </div>
        </div>
      </td>
      <td className="border-b border-border/80 p-0" style={{ height: rowHeight }}>
        <div
          className="relative bg-background"
          style={{
            display: 'grid',
            gridTemplateColumns,
            gridTemplateRows: `repeat(${laneCount}, ${LANE_HEIGHT_PX}px)`,
            width: timelineWidth,
            height: rowHeight,
          }}
        >
          {/* Grid lines — span tất cả rows */}
          {slots.map((slot, index) => (
            <div
              key={`${table.id}-${slot}`}
              style={{ gridColumn: index + 1, gridRow: `1 / ${laneCount + 1}` }}
              className={cn(
                'border-r',
                (minutesFromTime(slot) + 30) % 60 === 0 ? 'border-foreground/15' : 'border-border/35',
              )}
            />
          ))}

          {/* Booking bars */}
          {tableReservations.map((reservation) => {
            // Bar luôn dùng full estimated width — thể hiện slot bàn bị giữ
            const estimatedDuration = getBookingDurationMinutes(reservation.partySize)
            const style = getReservationGridStyle(reservation, slots)
            if (!style) return null

            const lane = laneOf[reservation.id] ?? 0
            const isSecondary = !!reservation.tableId && reservation.tableId !== table.id
            const isTerminal = ['completed', 'cancelled', 'no_show'].includes(reservation.status)

            const actualDuration =
              reservation.status === 'completed' && reservation.completedAt
                ? getEffectiveDurationMinutes(reservation)
                : null
            const actualPct = actualDuration !== null
              ? Math.min((actualDuration / estimatedDuration) * 100, 100)
              : null
            const actualLabel = actualDuration !== null ? formatDurationMinutes(actualDuration) : null

            return (
              <button
                key={reservation.id}
                type="button"
                onClick={() => onSelectReservation(reservation)}
                style={{ ...style, gridRow: lane + 1 }}
                title={[
                  `${reservation.name} - ${statusText(reservation.status)}`,
                  actualLabel ? `Thực tế: ${actualLabel}` : null,
                  isSecondary ? '(Bàn phụ ghép thêm)' : null,
                ].filter(Boolean).join(' · ')}
                className={cn(
                  'relative z-10 mx-0.5 my-2 flex h-10 items-center justify-between gap-2 overflow-hidden rounded-md border px-2 text-left text-xs font-bold shadow-xs transition-transform hover:-translate-y-0.5',
                  getBarClass(reservation),
                  isSecondary && 'border-dashed opacity-40',
                  isTerminal && hasOverlap && 'opacity-60',
                )}
              >
                {/* Thanh thực tế dùng bữa (amber stripe ở bottom, chỉ cho completed + completedAt) */}
                {actualPct !== null && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-0 h-1 rounded-b-sm bg-amber-400/80"
                    style={{ width: `${actualPct}%` }}
                  />
                )}

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
                  <span>{durationLabel(estimatedDuration)}</span>
                  {/* Label thực tế nhỏ bên cạnh nếu có */}
                  {actualLabel && (
                    <span className="ml-0.5 opacity-70">({actualLabel})</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </td>
    </tr>
  )
})
