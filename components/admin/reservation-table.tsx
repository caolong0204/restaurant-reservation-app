'use client'

import { createPortal } from 'react-dom'

import { CalendarReservationDetails } from '@/components/admin/calendar-reservation-details'
import { ReservationTableHeader } from '@/components/admin/reservation-table-header'
import { ReservationTableRow } from '@/components/admin/reservation-table-row'
import { TABLE_COLUMN_COUNT } from '@/components/admin/reservation-table-utils'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { useReservationTable } from '@/lib/hooks/use-reservation-table'
import type { Reservation, ReservationStatus } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

interface ReservationTableProps {
  reservations: Reservation[]
  onConfirm: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onUpdateStatus: (reservation: Reservation, newStatus: ReservationStatus) => void
  className?: string
  rowSlots?: number
  currentPage?: number
  pageSize?: number
  updatingStatusId?: string | null
}

export function ReservationTable({
  reservations,
  onConfirm,
  onCancel,
  onEdit,
  onUpdateStatus,
  className,
  rowSlots = 10,
  currentPage = 1,
  pageSize = rowSlots,
  updatingStatusId,
}: ReservationTableProps) {
  const tableState = useReservationTable({
    reservations,
    currentPage,
    pageSize,
    rowSlots,
  })

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg border border-border/80 bg-card shadow-xs',
        className,
      )}
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <Table className="min-w-[1100px] text-[13px]">
          <ReservationTableHeader
            sortField={tableState.sortField}
            sortOrder={tableState.sortOrder}
            onSort={tableState.handleSort}
          />
          <TableBody>
            {tableState.visibleReservations.map((reservation, index) => (
              <ReservationTableRow
                key={reservation.id}
                reservation={reservation}
                displayIndex={tableState.startIndex + index + 1}
                nowMs={tableState.nowMs}
                todayStr={tableState.todayStr}
                onConfirm={onConfirm}
                onCancel={onCancel}
                onEdit={onEdit}
                onUpdateStatus={onUpdateStatus}
                onRowClick={tableState.setSelectedReservation}
                isUpdatingStatus={updatingStatusId === reservation.id}
              />
            ))}
            {Array.from({ length: tableState.placeholderRows }).map((_, index) => (
              <TableRow
                key={`placeholder-row-${index}`}
                aria-hidden="true"
                className="h-[64px] border-border/50 bg-muted/20 hover:bg-muted/20"
              >
                <TableCell colSpan={TABLE_COLUMN_COUNT} className="p-0" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {tableState.isMounted &&
        tableState.selectedReservation &&
        createPortal(
          <CalendarReservationDetails
            reservation={tableState.selectedReservation}
            onClose={() => tableState.setSelectedReservation(null)}
            onCancel={(reservation) => {
              tableState.setSelectedReservation(null)
              onCancel(reservation)
            }}
            onEdit={(reservation) => {
              tableState.setSelectedReservation(null)
              onEdit(reservation)
            }}
            onUpdateStatus={async (reservation, status) => {
              await onUpdateStatus(reservation, status)
              tableState.setSelectedReservation(null)
            }}
          />,
          document.body,
        )}
    </div>
  )
}
