'use client'

import { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  CalendarClock,
  Home,
  ListChecks,
  LogOut,
  Plus,
  RefreshCcw,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { AdminReservationsView } from '@/components/admin/admin-reservations-view'
import { AssignTableModal } from '@/components/admin/assign-table-modal'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { CreateModal } from '@/components/admin/create-modal'
import { DayCalendarView } from '@/components/admin/day-calendar-view'
import { EditModal } from '@/components/admin/edit-modal'
import { useReservations } from '@/components/reservation-provider'
import { signOutAdmin } from '@/lib/auth-actions'
import { getTodayIso } from '@/lib/admin-calendar'
import { useAdminReservationActions } from '@/lib/hooks/use-admin-reservation-actions'
import type { AdminView } from '@/lib/hooks/use-admin-reservation-filters'
import { RESTAURANT } from '@/lib/restaurant'

function AdminNavButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: typeof ListChecks
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors',
        active
          ? 'bg-primary/15 text-foreground shadow-xs ring-1 ring-primary/25'
          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      <span className={cn(
        'flex size-8 items-center justify-center rounded-md',
        active ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground',
      )}>
        <Icon className="size-4" />
      </span>
      {label}
    </button>
  )
}

export function AdminDashboard() {
  const {
    reservations,
    tables,
    isLoading,
    refreshAdminData,
    createManualReservation,
    confirmReservation,
    cancelReservation,
    editReservation,
    updateReservationStatus,
    getAvailableTables,
  } = useReservations()

  const [view, setView] = useState<AdminView>('reservations')
  const [calendarDate, setCalendarDate] = useState(getTodayIso())

  const {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    editingReservation,
    assigningReservation,
    availableTables,
    isLoadingTables,
    cancelingReservation,
    openAssignModal,
    closeAssignModal,
    handleAssignConfirm,
    handleCancel,
    closeCancelModal,
    executeCancel,
    openEdit,
    closeEdit,
    handleCreateSubmit,
    handleEditSubmit,
    handleEditCancelBooking,
    handleUpdateStatus,
    updatingStatusId,
  } = useAdminReservationActions({
    reservations,
    createManualReservation,
    confirmReservation,
    cancelReservation,
    editReservation,
    updateReservationStatus,
    getAvailableTables,
  })

  const pageTitle = view === 'reservations' ? 'Danh sách đặt bàn' : 'Lịch ngày'
  const pageDescription =
    view === 'reservations'
      ? 'Theo dõi booking, trạng thái và thao tác gán bàn trong ngày.'
      : 'Theo dõi bàn, giờ phục vụ và lượt đặt trong ngày.'

  const setAdminView = (nextView: AdminView) => setView(nextView)

  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/80 bg-background px-4 py-4 lg:flex">
        <div className="px-2 py-2">
          <Image
            src="/flambe-logo.png"
            alt={RESTAURANT.name}
            width={764}
            height={326}
            priority
            className="h-auto w-28 object-contain"
          />
          <p className="mt-3 text-[11px] font-bold uppercase text-muted-foreground">
            Admin
          </p>
        </div>

        <nav className="mt-5 flex flex-col gap-1.5">
          <AdminNavButton
            active={view === 'reservations'}
            icon={ListChecks}
            label="Danh sách"
            onClick={() => setAdminView('reservations')}
          />
          <AdminNavButton
            active={view === 'calendar'}
            icon={CalendarClock}
            label="Lịch ngày"
            onClick={() => setAdminView('calendar')}
          />
        </nav>

        <div className="mt-auto space-y-1.5 border-t border-border/70 pt-4">
          <Link
            href="/"
            className="inline-flex h-7 w-full items-center justify-start gap-2 rounded-lg px-2.5 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Home className="size-4" />
            Trang chủ
          </Link>
          <form action={signOutAdmin}>
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg text-muted-foreground">
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </form>
        </div>
      </aside>

      <div className="border-b border-border/80 bg-background px-3 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Image
            src="/flambe-logo.png"
            alt={RESTAURANT.name}
            width={764}
            height={326}
            priority
            className="h-auto w-32 object-contain"
          />
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setAdminView('reservations')}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-xs font-bold',
                view === 'reservations' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              Danh sách
            </button>
            <button
              type="button"
              onClick={() => setAdminView('calendar')}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-xs font-bold',
                view === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              Lịch ngày
            </button>
          </div>
        </div>
      </div>

      <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-primary">
              {view === 'reservations' ? 'Booking Operations' : 'Table Timeline'}
            </p>
            <h1 className="mt-1 text-balance font-serif text-2xl font-bold text-foreground">
              {pageTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {pageDescription}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {view === 'calendar' ? (
              <Button
                size="icon"
                variant="outline"
                aria-label="Làm mới dữ liệu"
                className="size-9 shrink-0 rounded-lg bg-card"
                onClick={() => void refreshAdminData()}
                disabled={isLoading}
              >
                <RefreshCcw className={cn('size-4', isLoading && 'animate-spin')} />
              </Button>
            ) : null}
            {view === 'calendar' ? (
              <Button
                size="sm"
                className="h-9 shrink-0 gap-1.5 rounded-lg text-xs font-bold shadow-xs"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="size-3.5" />
                Tạo đặt bàn
              </Button>
            ) : null}
          </div>
        </div>

        {view === 'reservations' ? (
          <AdminReservationsView
            reservations={reservations}
            isLoading={isLoading}
            onRefresh={() => void refreshAdminData()}
            onCreateReservation={() => setIsCreateOpen(true)}
            onAssignModalOpen={(reservation) => void openAssignModal(reservation)}
            onCancel={(reservation) => void handleCancel(reservation)}
            onEdit={openEdit}
            onUpdateStatus={handleUpdateStatus}
            updatingStatusId={updatingStatusId}
          />
        ) : (
          <div className="mt-5">
            <DayCalendarView
              reservations={reservations}
              tables={tables}
              selectedDate={calendarDate}
              onDateChange={setCalendarDate}
              onConfirm={(reservation) => openAssignModal(reservation)}
              onCancel={(reservation) => void handleCancel(reservation)}
              onEdit={openEdit}
              onUpdateStatus={handleUpdateStatus}
              updatingStatusId={updatingStatusId}
            />
          </div>
        )}
      </main>

      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        tables={tables}
        getAvailableTables={getAvailableTables}
      />

      <EditModal
        isOpen={isEditOpen}
        onClose={closeEdit}
        reservation={editingReservation}
        onSubmit={handleEditSubmit}
        onCancelBooking={handleEditCancelBooking}
        tables={tables}
      />

      <AssignTableModal
        isOpen={Boolean(assigningReservation)}
        reservation={assigningReservation}
        availableTables={availableTables}
        isLoading={isLoadingTables}
        onClose={closeAssignModal}
        onConfirm={(tableId, secondaryTableIds, manualArrangement) =>
          handleAssignConfirm(tableId, secondaryTableIds, manualArrangement)
        }
      />

      <ConfirmModal
        isOpen={Boolean(cancelingReservation)}
        title="Xác nhận hủy đặt bàn"
        description={`Bạn có chắc chắn muốn hủy đặt bàn của khách ${cancelingReservation?.name}? Các bàn đang gán sẽ được giải phóng.`}
        confirmText="Hủy đặt bàn"
        cancelText="Quay lại"
        onConfirm={() => void executeCancel()}
        onCancel={closeCancelModal}
      />
    </div>
  )
}
