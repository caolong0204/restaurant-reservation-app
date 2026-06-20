import { AssignTableModal } from '@/components/admin/assign-table-modal'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { CreateModal } from '@/components/admin/create-modal'
import { EditModal } from '@/components/admin/edit-modal'
import type { AdminDashboardState } from '@/lib/hooks/use-admin-dashboard-state'
import type { OperatingHoursSnapshot, RestaurantTable } from '@/lib/reservation-types'

export function AdminDashboardModals({
  reservationActions,
  visibleTables,
  getAvailableTables,
  closeCreateReservation,
  confirmAssignedTable,
  executeCancelReservation,
  operatingHours,
}: {
  reservationActions: AdminDashboardState['reservationActions']
  visibleTables: RestaurantTable[]
  getAvailableTables: AdminDashboardState['getAvailableTables']
  closeCreateReservation: AdminDashboardState['closeCreateReservation']
  confirmAssignedTable: AdminDashboardState['confirmAssignedTable']
  executeCancelReservation: AdminDashboardState['executeCancelReservation']
  operatingHours: OperatingHoursSnapshot
}) {
  return (
    <>
      <CreateModal
        isOpen={reservationActions.isCreateOpen}
        onClose={closeCreateReservation}
        onSubmit={reservationActions.handleCreateSubmit}
        tables={visibleTables}
        getAvailableTables={getAvailableTables}
        weeklyHours={operatingHours.weeklyHours}
      />

      <EditModal
        isOpen={reservationActions.isEditOpen}
        onClose={reservationActions.closeEdit}
        reservation={reservationActions.editingReservation}
        onSubmit={reservationActions.handleEditSubmit}
        onCancelBooking={reservationActions.handleEditCancelBooking}
        tables={visibleTables}
        getAvailableTables={getAvailableTables}
        weeklyHours={operatingHours.weeklyHours}
      />

      <AssignTableModal
        isOpen={Boolean(reservationActions.assigningReservation)}
        reservation={reservationActions.assigningReservation}
        availableTables={reservationActions.availableTables}
        isLoading={reservationActions.isLoadingTables}
        onClose={reservationActions.closeAssignModal}
        onConfirm={confirmAssignedTable}
      />

      <ConfirmModal
        isOpen={Boolean(reservationActions.cancelingReservation)}
        title="Xác nhận hủy đặt bàn"
        description={`Bạn có chắc chắn muốn hủy đặt bàn của khách ${reservationActions.cancelingReservation?.name}? Các bàn đang gán sẽ được giải phóng.`}
        confirmText="Hủy đặt bàn"
        cancelText="Quay lại"
        onConfirm={executeCancelReservation}
        onCancel={reservationActions.closeCancelModal}
      />
    </>
  )
}
