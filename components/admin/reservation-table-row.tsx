import { memo } from 'react'
import { AlertTriangle } from 'lucide-react'

import {
  ReservationActionsCell,
  ReservationStatusCell,
} from '@/components/admin/reservation-table-row-actions'
import {
  AssignedTableCell,
  ContactCell,
  CreatedAtCell,
  GuestCell,
  PartySizeCell,
  reservationTimeMs,
} from '@/components/admin/reservation-table-row-cells'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  hasReservationServiceEnded,
  isPastReservation,
  ROW_BG_STYLES,
} from '@/lib/admin-calendar'
import type { Reservation, ReservationStatus } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

import {
  formatSheetDate,
  STICKY_ROW_BG_STYLES,
} from './reservation-table-utils'

export const ReservationTableRow = memo(function ReservationTableRow({
  reservation,
  displayIndex,
  nowMs,
  todayStr,
  onConfirm,
  onEdit,
  onCancel,
  onUpdateStatus,
  onRowClick,
  isUpdatingStatus,
}: {
  reservation: Reservation
  displayIndex: number
  nowMs: number
  todayStr: string
  onConfirm: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
  onUpdateStatus: (reservation: Reservation, newStatus: ReservationStatus) => void
  onRowClick: (reservation: Reservation) => void
  isUpdatingStatus?: boolean
}) {
  const isCancelled = reservation.status === 'cancelled'
  const isPending = reservation.status === 'pending'
  const isServiceEnded = hasReservationServiceEnded(reservation)
  const isNew = nowMs > 0 && nowMs - reservation.createdAt < 15 * 60 * 1000
  const isOverdue = isPending && nowMs > reservationTimeMs(reservation) + 15 * 60 * 1000
  const isPastDate = isPastReservation(reservation.date, todayStr)

  const bgClass =
    isNew && isPending
      ? 'bg-orange-50/50 hover:bg-orange-100/60 dark:bg-orange-950/20 dark:hover:bg-orange-950/30'
      : ROW_BG_STYLES[reservation.status] || 'text-foreground hover:bg-muted/50'
  const stickyBgClass =
    isNew && isPending
      ? 'bg-orange-50 dark:bg-orange-950'
      : STICKY_ROW_BG_STYLES[reservation.status] || 'bg-card'

  return (
    <TableRow
      className={cn(
        'group relative h-[64px] cursor-pointer border-b border-border/60 transition-colors',
        bgClass,
      )}
      onClick={() => onRowClick(reservation)}
    >
      <TableCell
        className={cn(
          'text-center font-mono tabular-nums',
          isCancelled ? 'text-muted-foreground/60' : 'text-muted-foreground',
        )}
      >
        {displayIndex}
      </TableCell>
      <TableCell
        className={cn(
          'text-center font-mono font-semibold tabular-nums',
          isCancelled ? 'text-muted-foreground/80' : 'text-foreground',
        )}
      >
        {formatSheetDate(reservation.date)}
      </TableCell>
      <TableCell
        className={cn(
          'text-center font-mono font-semibold tabular-nums',
          isCancelled ? 'text-muted-foreground/80' : 'text-foreground',
        )}
      >
        {isOverdue ? (
          <div className="inline-flex items-center gap-1.5 rounded-md border border-red-100 bg-red-50 px-2 py-1 text-red-600">
            <AlertTriangle className="size-3.5" />
            <span className="animate-pulse">{reservation.time}</span>
          </div>
        ) : (
          reservation.time
        )}
      </TableCell>
      <CreatedAtCell timestamp={reservation.createdAt} isCancelled={isCancelled} />
      <GuestCell reservation={reservation} isCancelled={isCancelled} isNew={isNew} />
      <ContactCell reservation={reservation} isCancelled={isCancelled} />
      <PartySizeCell reservation={reservation} isCancelled={isCancelled} />
      <TableCell
        className={cn('text-center', isCancelled ? 'text-muted-foreground/80' : 'text-foreground')}
      >
        {reservation.occasion || '-'}
      </TableCell>
      <AssignedTableCell
        reservation={reservation}
        isServiceEnded={isServiceEnded}
        onConfirm={onConfirm}
      />
      <ReservationStatusCell
        reservation={reservation}
        isPastDate={isPastDate}
        isUpdatingStatus={isUpdatingStatus}
        onUpdateStatus={onUpdateStatus}
      />
      <ReservationActionsCell
        reservation={reservation}
        isPastDate={isPastDate}
        isServiceEnded={isServiceEnded}
        stickyBgClass={stickyBgClass}
        onConfirm={onConfirm}
        onEdit={onEdit}
        onCancel={onCancel}
      />
    </TableRow>
  )
})
