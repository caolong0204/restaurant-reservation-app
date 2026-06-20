'use client'

import { useState } from 'react'

import { AdminMobileNav, AdminSidebar } from '@/components/admin/admin-navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminAccountsView } from '@/components/admin/admin-accounts-view'
import { AdminDashboardModals } from '@/components/admin/admin-dashboard-modals'
import { AdminReservationsView } from '@/components/admin/admin-reservations-view'
import { AdminSettingsView } from '@/components/admin/admin-settings-view'
import { DayCalendarView } from '@/components/admin/day-calendar-view'
import { useAdminDashboardState } from '@/lib/hooks/use-admin-dashboard-state'
import type {
  OperatingHoursSnapshot,
  Reservation,
  RestaurantTable,
  StaffAccount,
} from '@/lib/reservation-types'

export function AdminDashboard({
  canManageSettings = false,
  initialReservations = [],
  initialTables = [],
  initialStaffAccounts = [],
  currentStaffUserId,
  operatingHours,
}: {
  canManageSettings?: boolean
  initialReservations?: Reservation[]
  initialTables?: RestaurantTable[]
  initialStaffAccounts?: StaffAccount[]
  currentStaffUserId?: string
  operatingHours: OperatingHoursSnapshot
}) {
  const [operatingHoursState, setOperatingHoursState] = useState(operatingHours)
  const {
    view,
    calendarDate,
    setCalendarDate,
    setAdminView,
    pageTitle,
    pageDescription,
    visibleTables,
    visibleReservations,
    activeTables,
    isLoading,
    refresh,
    openCreateReservation,
    closeCreateReservation,
    openAssignReservation,
    cancelReservation,
    confirmAssignedTable,
    executeCancelReservation,
    refreshAdminData,
    getAvailableTables,
    reservationActions,
  } = useAdminDashboardState({
    canManageSettings,
    initialReservations,
    initialTables,
  })

  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex">
      <AdminSidebar
        view={view}
        canManageSettings={canManageSettings}
        onViewChange={setAdminView}
      />
      <AdminMobileNav
        view={view}
        canManageSettings={canManageSettings}
        onViewChange={setAdminView}
      />

      <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6">
        <AdminPageHeader
          title={pageTitle}
          description={pageDescription}
          reservations={visibleReservations}
        />

        {view === 'reservations' ? (
          <AdminReservationsView
            reservations={visibleReservations}
            isLoading={isLoading}
            onRefresh={refresh}
            onCreateReservation={openCreateReservation}
            onAssignModalOpen={openAssignReservation}
            onCancel={cancelReservation}
            onEdit={reservationActions.openEdit}
            onUpdateStatus={reservationActions.handleUpdateStatus}
            updatingStatusId={reservationActions.updatingStatusId}
          />
        ) : view === 'calendar' ? (
          <div className="mt-5">
            <DayCalendarView
              reservations={visibleReservations}
              tables={activeTables}
              selectedDate={calendarDate}
              onDateChange={setCalendarDate}
              onConfirm={reservationActions.openAssignModal}
              onCancel={cancelReservation}
              onEdit={reservationActions.openEdit}
              onUpdateStatus={reservationActions.handleUpdateStatus}
              updatingStatusId={reservationActions.updatingStatusId}
              isLoading={isLoading}
              onRefresh={refresh}
              onCreateReservation={openCreateReservation}
            />
          </div>
        ) : view === 'settings' ? (
          <AdminSettingsView
            tables={visibleTables}
            reservations={visibleReservations}
            isLoading={isLoading}
            onRefresh={refreshAdminData}
            operatingHours={operatingHoursState}
            onOperatingHoursSaved={setOperatingHoursState}
          />
        ) : (
          <AdminAccountsView
            initialAccounts={initialStaffAccounts}
            currentUserId={currentStaffUserId}
          />
        )}
      </main>

      <AdminDashboardModals
        reservationActions={reservationActions}
        visibleTables={visibleTables}
        getAvailableTables={getAvailableTables}
        closeCreateReservation={closeCreateReservation}
        confirmAssignedTable={confirmAssignedTable}
        executeCancelReservation={executeCancelReservation}
        operatingHours={operatingHoursState}
      />
    </div>
  )
}
