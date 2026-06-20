'use client'

import { CalendarReservationDetails } from '@/components/admin/calendar-reservation-details'
import { DayCalendarGrid } from '@/components/admin/day-calendar-grid'
import { DayCalendarToolbar } from '@/components/admin/day-calendar-toolbar'
import { PendingReservationsPanel } from '@/components/admin/pending-reservations-panel'
import { useDayCalendarView } from '@/lib/hooks/use-day-calendar-view'
import type { Reservation, ReservationStatus, RestaurantTable } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

interface DayCalendarViewProps {
  reservations: Reservation[]
  tables: RestaurantTable[]
  selectedDate: string
  onDateChange: (date: string) => void
  onConfirm: (reservation: Reservation) => void | Promise<void>
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onUpdateStatus: (reservation: Reservation, status: ReservationStatus) => void
  updatingStatusId?: string | null
  isLoading?: boolean
  onRefresh?: () => void
  onCreateReservation?: () => void
}

export function DayCalendarView({
  reservations,
  tables,
  selectedDate,
  onDateChange,
  onConfirm,
  onCancel,
  onEdit,
  onUpdateStatus,
  updatingStatusId,
  isLoading,
  onRefresh,
  onCreateReservation,
}: DayCalendarViewProps) {
  const calendar = useDayCalendarView({
    reservations,
    tables,
    selectedDate,
    onConfirm,
  })

  return (
    <div
      className={cn(
        'grid gap-4',
        !calendar.isPastDate ? 'xl:grid-cols-[minmax(0,1fr)_300px]' : 'xl:grid-cols-1',
      )}
    >
      <div className="min-w-0 space-y-4">
        <DayCalendarToolbar
          selectedDate={selectedDate}
          isCalendarOpen={calendar.isCalendarOpen}
          isLoading={isLoading}
          onCalendarOpenChange={calendar.setIsCalendarOpen}
          onDateChange={onDateChange}
          onRefresh={onRefresh}
          onCreateReservation={onCreateReservation}
        />

        <DayCalendarGrid
          activeTables={calendar.activeTables}
          assignedReservations={calendar.assignedReservations}
          slots={calendar.slots}
          labelledSlots={calendar.labelledSlots}
          gridTemplateColumns={calendar.gridTemplateColumns}
          timelineWidth={calendar.timelineWidth}
          currentTimeLeft={calendar.currentTimeLeft}
          onSelectReservation={calendar.setSelectedReservation}
        />
      </div>

      {!calendar.isPastDate && (
        <PendingReservationsPanel
          pendingReservations={calendar.pendingUnassignedReservations}
          visibleReservations={calendar.visiblePendingReservations}
          hiddenCount={calendar.hiddenPendingCount}
          isExpanded={calendar.isPendingExpanded}
          assigningReservationId={calendar.assigningPendingId}
          onToggleExpanded={() => calendar.setIsPendingExpanded((value) => !value)}
          onSelectReservation={calendar.setSelectedReservation}
          onConfirm={(reservation) => void calendar.handlePendingConfirm(reservation)}
        />
      )}

      {calendar.selectedReservation && (
        <CalendarReservationDetails
          reservation={calendar.selectedReservation}
          onClose={() => calendar.setSelectedReservation(null)}
          onCancel={(reservation) => {
            onCancel(reservation)
            calendar.setSelectedReservation(null)
          }}
          onEdit={(reservation) => {
            onEdit(reservation)
            calendar.setSelectedReservation(null)
          }}
          onUpdateStatus={onUpdateStatus}
          isUpdatingStatus={updatingStatusId === calendar.selectedReservation.id}
        />
      )}
    </div>
  )
}
