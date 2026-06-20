import { TimelineRow } from '@/components/admin/timeline-row'
import {
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatTimelineHeader,
  getHeaderCellStyle,
} from '@/lib/admin-calendar'
import type { Reservation, RestaurantTable } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

export function DayCalendarGrid({
  activeTables,
  assignedReservations,
  slots,
  labelledSlots,
  gridTemplateColumns,
  timelineWidth,
  currentTimeLeft,
  onSelectReservation,
}: {
  activeTables: RestaurantTable[]
  assignedReservations: Reservation[]
  slots: string[]
  labelledSlots: string[]
  gridTemplateColumns: string
  timelineWidth: number
  currentTimeLeft: number | null
  onSelectReservation: (reservation: Reservation) => void
}) {
  return (
    <div className="overflow-auto rounded-lg border border-border/80 bg-card shadow-xs">
      <div className="relative w-max">
        <table className="w-max caption-bottom border-separate border-spacing-0 text-sm">
          <TableHeader>
            <TableRow className="border-border bg-secondary hover:bg-secondary">
              <TableHead className="sticky left-0 z-50 w-32 min-w-32 border-r border-border bg-secondary text-left font-bold text-foreground shadow-[3px_0_6px_-4px_rgba(0,0,0,0.35)]">
                <div className="px-3">
                  <span className="block">Bàn</span>
                  <span className="text-[10px] font-medium text-muted-foreground">Sức chứa</span>
                </div>
              </TableHead>
              <TableHead className="h-11 p-0">
                <div
                  className="grid h-11 bg-secondary"
                  style={{ gridTemplateColumns, width: timelineWidth }}
                >
                  {labelledSlots.map((slot, index) => (
                    <div key={slot} style={getHeaderCellStyle(slot, slots)} className="flex items-center">
                      <span
                        className={cn(
                          'whitespace-nowrap font-mono text-[10px] font-bold tabular-nums text-foreground',
                          index > 0 && '-translate-x-1/2',
                        )}
                      >
                        {formatTimelineHeader(slot)}
                      </span>
                    </div>
                  ))}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeTables.map((table) => (
              <TimelineRow
                key={table.id}
                table={table}
                tableReservations={assignedReservations.filter(
                  (reservation) =>
                    reservation.tableId === table.id ||
                    Boolean(reservation.secondaryTableIds?.includes(table.id)),
                )}
                slots={slots}
                gridTemplateColumns={gridTemplateColumns}
                timelineWidth={timelineWidth}
                onSelectReservation={onSelectReservation}
              />
            ))}
          </TableBody>
        </table>

        {currentTimeLeft !== null && <CurrentTimeIndicator left={currentTimeLeft} />}
      </div>
    </div>
  )
}

function CurrentTimeIndicator({ left }: { left: number }) {
  return (
    <div
      className="pointer-events-none absolute bottom-0 top-0 z-40 w-[2px] bg-primary shadow-[0_0_8px_rgba(210,159,14,0.35)]"
      style={{ left: `${left}px` }}
    >
      <div className="absolute -left-1.5 -top-1.5 size-3.5 rounded-full border-2 border-white bg-primary" />
    </div>
  )
}
