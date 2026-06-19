'use client'

import { CalendarDays, Loader2 } from 'lucide-react'

import { AdminReservationFilters } from '@/components/admin/admin-reservation-filters'
import { ReservationTable } from '@/components/admin/reservation-table'
import { ReservationTablePagination } from '@/components/admin/reservation-table-pagination'
import { useAdminReservationFilters, type AdminFilter } from '@/lib/hooks/use-admin-reservation-filters'
import type { Reservation, ReservationStatus } from '@/lib/reservation-types'

const FILTERS: Array<{ value: AdminFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'serving', label: 'Đang phục vụ' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
]

interface AdminReservationsViewProps {
  reservations: Reservation[]
  isLoading: boolean
  onRefresh: () => void
  onCreateReservation: () => void
  onAssignModalOpen: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onUpdateStatus: (reservation: Reservation, status: ReservationStatus) => void
  updatingStatusId?: string | null
}

export function AdminReservationsView({
  reservations,
  isLoading,
  onRefresh,
  onCreateReservation,
  onAssignModalOpen,
  onCancel,
  onEdit,
  onUpdateStatus,
  updatingStatusId,
}: AdminReservationsViewProps) {
  const {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    isDateFilterOpen,
    setIsDateFilterOpen,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    counts,
    filtered,
  } = useAdminReservationFilters(reservations)

  return (
    <div className="mt-5 flex flex-col gap-4">
      <AdminReservationFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        isDateFilterOpen={isDateFilterOpen}
        onDateFilterOpenChange={setIsDateFilterOpen}
        filter={filter}
        onFilterChange={(value) => setFilter(value as AdminFilter)}
        counts={counts}
        filters={FILTERS}
        onCreateReservation={onCreateReservation}
        onRefresh={onRefresh}
        isRefreshing={isLoading}
      />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-border bg-card py-24 shadow-xs">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm">Đang tải danh sách đặt bàn…</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/80 bg-card py-20 text-center shadow-xs">
          <CalendarDays className="size-9 text-muted-foreground/60" />
          <div>
            <p className="font-serif text-base font-bold text-foreground">
              Không tìm thấy lượt đặt bàn nào
            </p>
            <p className="mx-auto mt-1 max-w-[280px] text-pretty text-xs text-muted-foreground">
              Kiểm tra lại bộ lọc, ô tìm kiếm hoặc ngày được chọn.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <ReservationTable
            reservations={filtered}
            rowSlots={pageSize}
            currentPage={currentPage}
            pageSize={pageSize}
            onConfirm={onAssignModalOpen}
            onCancel={onCancel}
            onEdit={onEdit}
            onUpdateStatus={onUpdateStatus}
            updatingStatusId={updatingStatusId}
          />

          {totalPages > 1 && (
            <ReservationTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
