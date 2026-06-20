import { Armchair, Mail, Phone, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import type { Reservation } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

import { formatTableDisplay } from './reservation-table-utils'

export function reservationTimeMs(reservation: Reservation) {
  const [year, month, day] = reservation.date.split('-').map(Number)
  const [hour, minute] = reservation.time.split(':').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return Infinity
  return new Date(year, month - 1, day, hour, minute).getTime()
}

export function CreatedAtCell({ timestamp, isCancelled }: { timestamp: number; isCancelled: boolean }) {
  const createdAt = new Date(timestamp)
  return (
    <TableCell
      className={cn(
        'text-center font-mono tabular-nums',
        isCancelled ? 'text-muted-foreground/40' : 'text-muted-foreground/70',
      )}
    >
      <div className="whitespace-nowrap text-[10px] leading-tight">
        {createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}-
        {createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
      </div>
    </TableCell>
  )
}

export function GuestCell({
  reservation,
  isCancelled,
  isNew,
}: {
  reservation: Reservation
  isCancelled: boolean
  isNew: boolean
}) {
  return (
    <TableCell className="text-center">
      <div
        className={cn(
          'relative mx-auto block max-w-44 truncate text-center font-bold',
          isCancelled ? 'text-muted-foreground/60 line-through' : 'text-foreground',
        )}
        title={reservation.name}
      >
        {isNew && (
          <span className="mr-1.5 inline-flex animate-pulse items-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-white">
            Mới
          </span>
        )}
        {reservation.name}
      </div>
      {reservation.notes && (
        <p
          className={cn(
            'mx-auto mt-0.5 max-w-48 truncate text-center text-[11px]',
            isCancelled ? 'text-muted-foreground/60' : 'text-muted-foreground',
          )}
          title={reservation.notes}
        >
          {reservation.notes}
        </p>
      )}
      {isNew && (
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-orange-400 shadow-[2px_0_8px_rgba(251,146,60,0.5)]" />
      )}
    </TableCell>
  )
}

export function ContactCell({
  reservation,
  isCancelled,
}: {
  reservation: Reservation
  isCancelled: boolean
}) {
  return (
    <TableCell
      className={cn('text-center font-mono', isCancelled ? 'text-muted-foreground/80' : 'text-foreground')}
    >
      <span className="inline-flex items-center justify-center gap-1">
        <Phone
          className={cn('size-3', isCancelled ? 'text-muted-foreground/60' : 'text-muted-foreground')}
        />
        {reservation.phone}
      </span>
      {reservation.email && (
        <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground/70">
          <Mail className="size-2.5" />
          <span className="max-w-[120px] truncate">{reservation.email}</span>
        </div>
      )}
    </TableCell>
  )
}

export function PartySizeCell({
  reservation,
  isCancelled,
}: {
  reservation: Reservation
  isCancelled: boolean
}) {
  return (
    <TableCell
      className={cn(
        'text-center font-mono font-bold',
        isCancelled ? 'text-muted-foreground/80' : 'text-foreground',
      )}
    >
      <span className="inline-flex items-center justify-center gap-1">
        {reservation.partySize}
        <Users
          className={cn('size-3', isCancelled ? 'text-muted-foreground/60' : 'text-muted-foreground')}
        />
      </span>
    </TableCell>
  )
}

export function AssignedTableCell({
  reservation,
  isServiceEnded,
  onConfirm,
}: {
  reservation: Reservation
  isServiceEnded: boolean
  onConfirm: (reservation: Reservation) => void
}) {
  return (
    <TableCell className="text-center">
      {reservation.table ? (
        <Badge
          variant="outline"
          className="mx-auto rounded-md border-emerald-500/30 bg-emerald-500/10 font-mono text-emerald-700"
        >
          <Armchair className="mr-1 size-3" />
          {formatTableDisplay(reservation)}
        </Badge>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation()
            onConfirm(reservation)
          }}
          disabled={isServiceEnded}
          title={isServiceEnded ? 'Booking đã hết thời lượng phục vụ' : 'Gán bàn'}
          className="mx-auto inline-flex h-auto items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-800 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Armchair className="size-3" />
          Gán bàn
        </Button>
      )}
    </TableCell>
  )
}
