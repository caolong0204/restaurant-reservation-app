'use client'

import { CalendarDays, CalendarClock, Loader2, Plus, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { AdminDashboardHeader } from '@/components/admin/admin-dashboard-header'
import { AdminReservationFilters } from '@/components/admin/admin-reservation-filters'
import { AdminStatsBar } from '@/components/admin/admin-stats-bar'
import { AssignTableModal } from '@/components/admin/assign-table-modal'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { CreateModal } from '@/components/admin/create-modal'
import { DayCalendarView } from '@/components/admin/day-calendar-view'
import { EditModal } from '@/components/admin/edit-modal'
import { ReservationTable } from '@/components/admin/reservation-table'
import { useReservations, type ReservationStatus } from '@/components/reservation-provider'
import { useAdminReservationActions } from '@/lib/hooks/use-admin-reservation-actions'
import { useAdminReservationFilters, type AdminFilter } from '@/lib/hooks/use-admin-reservation-filters'

const FILTERS: Array<{ value: AdminFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'cancelled', label: 'Đã hủy' },
]

export function AdminDashboard() {
  const {
    reservations,
    tables,
    isLoading,
    actionError,
    refreshAdminData,
    createManualReservation,
    confirmReservation,
    cancelReservation,
    editReservation,
    getAvailableTables,
  } = useReservations()

  const {
    view,
    setView,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    isDateFilterOpen,
    setIsDateFilterOpen,
    calendarDate,
    setCalendarDate,
    counts,
    filtered,
  } = useAdminReservationFilters(reservations)

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
  } = useAdminReservationActions({
    reservations,
    createManualReservation,
    confirmReservation,
    cancelReservation,
    editReservation,
    getAvailableTables,
  })

  return (
    <div className="min-h-dvh bg-secondary/15">
      <AdminDashboardHeader />

      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-4">
        {actionError && (
          <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <CalendarClock className="size-5" />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                Điều phối đặt bàn
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Quản lý booking, kiểm tra lịch và gán bàn khi xác nhận.
              </p>
            </div>
          </div>
        </div>

        <AdminStatsBar reservations={reservations} />

        <div className="mt-8 flex items-center justify-between gap-2 border-b border-border/80 pb-2 overflow-x-auto">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView('reservations')}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-bold transition-colors',
                view === 'reservations' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
              )}
            >
              Danh sách
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-bold transition-colors',
                view === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
              )}
            >
              Lịch ngày
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="size-8.5 shrink-0 rounded-lg"
              onClick={() => void refreshAdminData()}
              disabled={isLoading}
            >
              <RefreshCcw className={cn('size-4', isLoading && 'animate-spin')} />
            </Button>
            <Button
              size="sm"
              className="h-8.5 shrink-0 gap-1.5 rounded-lg text-xs shadow-xs"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-3.5" />
              Đặt bàn
            </Button>
          </div>
        </div>

        {view === 'reservations' ? (
          <>
            <AdminReservationFilters
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              isDateFilterOpen={isDateFilterOpen}
              onDateFilterOpenChange={setIsDateFilterOpen}
              filter={filter}
              onFilterChange={(value) => setFilter(value as 'all' | ReservationStatus)}
              counts={counts}
              filters={FILTERS}
            />

            <div className="mt-6">
              {isLoading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card shadow-xs">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="text-sm">Đang tải danh sách đặt bàn...</span>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/80 bg-card py-20 text-center shadow-xs">
                  <CalendarDays className="size-9 text-muted-foreground/60" />
                  <div>
                    <p className="font-serif text-base font-bold text-foreground">
                      Không tìm thấy lượt đặt bàn nào
                    </p>
                    <p className="mx-auto mt-1 max-w-[280px] text-xs text-muted-foreground">
                      Vui lòng kiểm tra lại bộ lọc, ô tìm kiếm hoặc ngày được chọn.
                    </p>
                  </div>
                </div>
              ) : (
                <ReservationTable
                  reservations={filtered}
                  onConfirm={(reservation) => void openAssignModal(reservation)}
                  onCancel={(reservation) => void handleCancel(reservation)}
                  onEdit={openEdit}
                />
              )}
            </div>
          </>
        ) : (
          <div className="mt-6">
            <DayCalendarView
              reservations={reservations}
              tables={tables}
              selectedDate={calendarDate}
              onDateChange={setCalendarDate}
              onConfirm={(reservation) => void openAssignModal(reservation)}
              onCancel={(reservation) => void handleCancel(reservation)}
              onEdit={openEdit}
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
          void handleAssignConfirm(tableId, secondaryTableIds, manualArrangement)
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
