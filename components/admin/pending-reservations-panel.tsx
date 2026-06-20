import { Armchair, ChevronDown, Clock, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Reservation } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

export function PendingReservationsPanel({
  pendingReservations,
  visibleReservations,
  hiddenCount,
  isExpanded,
  assigningReservationId,
  onToggleExpanded,
  onSelectReservation,
  onConfirm,
}: {
  pendingReservations: Reservation[]
  visibleReservations: Reservation[]
  hiddenCount: number
  isExpanded: boolean
  assigningReservationId: string | null
  onToggleExpanded: () => void
  onSelectReservation: (reservation: Reservation) => void
  onConfirm: (reservation: Reservation) => void
}) {
  return (
    <aside className="rounded-lg border border-border/80 bg-card p-2 shadow-xs xl:sticky xl:top-4 xl:self-start">
      <div className="flex items-center justify-between gap-2 px-1.5 py-1.5">
        <h2 className="font-serif text-base font-bold text-foreground">Chờ gán bàn</h2>
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
          {pendingReservations.length}
        </span>
      </div>

      <div className="mt-1 overflow-hidden rounded-lg border border-border/80 bg-background/55">
        {pendingReservations.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            Không có booking chờ gán bàn.
          </div>
        ) : (
          visibleReservations.map((reservation) => (
            <PendingReservationItem
              key={reservation.id}
              reservation={reservation}
              assigningReservationId={assigningReservationId}
              onSelectReservation={onSelectReservation}
              onConfirm={onConfirm}
            />
          ))
        )}
      </div>

      {hiddenCount > 0 || isExpanded ? (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10"
        >
          {isExpanded ? 'Thu gọn' : `Xem thêm (${hiddenCount})`}
          <ChevronDown className={cn('size-4 transition-transform', isExpanded && 'rotate-180')} />
        </button>
      ) : null}
    </aside>
  )
}

function PendingReservationItem({
  reservation,
  assigningReservationId,
  onSelectReservation,
  onConfirm,
}: {
  reservation: Reservation
  assigningReservationId: string | null
  onSelectReservation: (reservation: Reservation) => void
  onConfirm: (reservation: Reservation) => void
}) {
  return (
    <div
      onClick={() => onSelectReservation(reservation)}
      className="group grid cursor-pointer grid-cols-[1fr_auto] gap-3 border-b border-border/70 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-muted/30"
    >
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <Clock className="size-4 shrink-0 text-primary" />
          <span className="font-mono text-sm font-bold tabular-nums text-foreground transition-colors group-hover:text-primary">
            {reservation.time}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="truncate text-sm font-bold text-foreground">{reservation.name}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 pl-6 text-xs text-muted-foreground">
          <Armchair className="size-3.5" />
          {reservation.partySize} khách
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={Boolean(assigningReservationId)}
        aria-busy={assigningReservationId === reservation.id}
        onClick={(event) => {
          event.stopPropagation()
          onConfirm(reservation)
        }}
        className="relative z-10 mt-6 h-8 rounded-lg border-primary/25 px-3 text-xs font-bold text-primary hover:bg-primary/10"
      >
        {assigningReservationId === reservation.id ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          'Gán bàn'
        )}
      </Button>
    </div>
  )
}
