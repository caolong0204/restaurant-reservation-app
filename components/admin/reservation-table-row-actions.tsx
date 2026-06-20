import { Check, Edit3, Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import {
  getSelectableStatuses,
  STATUS_STYLES,
} from '@/lib/admin-calendar'
import type { Reservation, ReservationStatus } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

export function ReservationStatusCell({
  reservation,
  isPastDate,
  isUpdatingStatus,
  onUpdateStatus,
}: {
  reservation: Reservation
  isPastDate: boolean
  isUpdatingStatus?: boolean
  onUpdateStatus: (reservation: Reservation, newStatus: ReservationStatus) => void
}) {
  return (
    <TableCell className="w-32 text-center" onClick={(event) => event.stopPropagation()}>
      <div className="relative inline-flex group/status">
        <select
          aria-label="Cập nhật trạng thái"
          value={reservation.status}
          disabled={isUpdatingStatus || (isPastDate && reservation.status === 'pending')}
          onChange={(event) =>
            onUpdateStatus(reservation, event.target.value as ReservationStatus)
          }
          className={cn(
            'w-[7.5rem] cursor-pointer appearance-none rounded-full border py-1.5 pl-2.5 pr-6 text-xs font-semibold outline-none transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
            STATUS_STYLES[reservation.status],
          )}
        >
          {getSelectableStatuses(reservation.status, isPastDate).map(([value, label]) => (
            <option key={value} value={value} className="bg-background text-foreground">
              {label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          {isUpdatingStatus ? (
            <Loader2 className="size-3.5 animate-spin opacity-70" />
          ) : (
            <svg
              className="size-3.5 opacity-70 transition-opacity group-hover/status:opacity-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>
    </TableCell>
  )
}

export function ReservationActionsCell({
  reservation,
  isPastDate,
  isServiceEnded,
  stickyBgClass,
  onConfirm,
  onEdit,
  onCancel,
}: {
  reservation: Reservation
  isPastDate: boolean
  isServiceEnded: boolean
  stickyBgClass: string
  onConfirm: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
}) {
  return (
    <TableCell
      className={cn(
        'sticky right-0 z-10 w-24 min-w-24 border-l border-border text-center shadow-[-3px_0_6px_-3px_rgba(0,0,0,0.12)]',
        stickyBgClass,
      )}
      onClick={(event) => event.stopPropagation()}
    >
      {isPastDate ? (
        <span className="text-xs italic text-muted-foreground/50">-</span>
      ) : (
        <div className="flex justify-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Sửa thông tin"
            title={isServiceEnded ? 'Booking đã hết thời lượng phục vụ' : 'Sửa thông tin'}
            disabled={isServiceEnded}
            onClick={() => onEdit(reservation)}
          >
            <Edit3 className="size-3.5" />
          </Button>

          {reservation.status === 'pending' && (
            <Button
              size="icon-sm"
              className="bg-red-600 text-white hover:bg-red-700"
              aria-label="Hủy booking"
              title="Hủy booking"
              disabled={isServiceEnded}
              onClick={() => onCancel(reservation)}
            >
              <X className="size-3.5" />
            </Button>
          )}

          {reservation.status !== 'confirmed' && (
            <Button
              size="icon-sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              title={isServiceEnded ? 'Booking đã hết thời lượng phục vụ' : 'Gán bàn và xác nhận'}
              disabled={isServiceEnded}
              onClick={() => onConfirm(reservation)}
            >
              <Check className="size-3.5" />
            </Button>
          )}
        </div>
      )}
    </TableCell>
  )
}
