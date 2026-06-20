'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import type {
  Reservation,
  ReservationEditInput,
  ReservationInput,
  ReservationStatus,
  RestaurantTable,
  ActionResult,
} from '@/lib/reservation-types'

type CreateManualReservationFn = (data: ReservationInput) => Promise<ActionResult<Reservation>>
type ConfirmReservationFn = (
  id: string,
  tableId: string,
  secondaryTableIds?: string[],
  manualArrangement?: boolean,
) => Promise<ActionResult<Reservation>>
type CancelReservationFn = (id: string) => Promise<ActionResult<Reservation>>
type EditReservationFn = (id: string, data: ReservationEditInput) => Promise<ActionResult<Reservation>>
type UpdateReservationStatusFn = (id: string, status: ReservationStatus) => Promise<ActionResult<Reservation>>
type GetAvailableTablesFn = (
  date: string,
  time: string,
  partySize: number,
  excludingReservationId?: string,
) => Promise<ActionResult<RestaurantTable[]>>

type UseAdminReservationActionsArgs = {
  reservations: Reservation[]
  createManualReservation: CreateManualReservationFn
  confirmReservation: ConfirmReservationFn
  cancelReservation: CancelReservationFn
  editReservation: EditReservationFn
  updateReservationStatus: UpdateReservationStatusFn
  getAvailableTables: GetAvailableTablesFn
}

export function useAdminReservationActions({
  reservations,
  createManualReservation,
  confirmReservation,
  cancelReservation,
  editReservation,
  updateReservationStatus,
  getAvailableTables,
}: UseAdminReservationActionsArgs) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null)
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [cancelingReservation, setCancelingReservation] = useState<Reservation | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)

  const openAssignModal = useCallback(
    async (reservation: Reservation) => {
      setAssigningReservation(reservation)
      setAvailableTables([])
      setIsLoadingTables(true)

      const result = await getAvailableTables(
        reservation.date,
        reservation.time,
        reservation.partySize,
        reservation.id,
      )

      if (result.ok) {
        setAvailableTables(result.data)
      } else {
        toast.error('Không tải được bàn trống', {
          description: result.error,
        })
      }

      setIsLoadingTables(false)
    },
    [getAvailableTables],
  )

  const closeAssignModal = useCallback(() => {
    setAssigningReservation(null)
    setAvailableTables([])
  }, [])

  const handleAssignConfirm = useCallback(
    async (tableId: string, secondaryTableIds: string[] = [], manualArrangement = false) => {
      if (!assigningReservation) return

      const result = await confirmReservation(
        assigningReservation.id,
        tableId,
        secondaryTableIds,
        manualArrangement,
      )
      if (result.ok) {
        const mainCode = result.data.table?.code ?? ''
        const secondaryCodes =
          result.data.secondaryTables && result.data.secondaryTables.length > 0
            ? ` + ${result.data.secondaryTables.map((table) => table.code).join(' + ')}`
            : ''

        toast.success(`Đã xác nhận đặt bàn cho ${result.data.name}`, {
          description: `Bàn ${mainCode}${secondaryCodes} đã được gán.`,
        })

        closeAssignModal()
        return
      }

      toast.error('Không xác nhận được đặt bàn', {
        description: result.error,
      })
    },
    [assigningReservation, closeAssignModal, confirmReservation],
  )

  const handleCancel = useCallback((reservation: Reservation) => {
    setCancelingReservation(reservation)
  }, [])

  const closeCancelModal = useCallback(() => {
    setCancelingReservation(null)
  }, [])

  const executeCancel = useCallback(async () => {
    if (!cancelingReservation) return
    const reservation = cancelingReservation
    const result = await cancelReservation(reservation.id)
    if (result.ok) {
      toast(`Đã hủy đặt bàn của ${reservation.name}`)
      closeCancelModal()
      return
    }

    toast.error('Không hủy được đặt bàn', {
      description: result.error,
    })
    closeCancelModal()
  }, [cancelReservation, cancelingReservation, closeCancelModal])

  const openEdit = useCallback((reservation: Reservation) => {
    setEditingReservation(reservation)
    setIsEditOpen(true)
  }, [])

  const closeEdit = useCallback(() => {
    setIsEditOpen(false)
    setEditingReservation(null)
  }, [])

  const handleCreateSubmit = useCallback(
    async (data: ReservationInput) => {
      const result = await createManualReservation(data)
      if (result.ok) {
        toast.success(`Đã thêm đặt bàn cho ${data.name}`, {
          description:
            result.data.status === 'confirmed'
              ? `Booking đã được xác nhận với ${result.data.table?.code ?? 'bàn đã chọn'}.`
              : 'Booking đang chờ gán bàn để xác nhận.',
        })
        setIsCreateOpen(false)
        return true
      }

      toast.error('Không thêm được đặt bàn', {
        description: result.error,
      })
      return false
    },
    [createManualReservation],
  )

  const handleEditSubmit = useCallback(
    async (id: string, data: ReservationEditInput) => {
      const result = await editReservation(id, data)
      if (result.ok) {
        toast.success(`Đã cập nhật đặt bàn của ${data.name}`)
        closeEdit()
        return
      }

      toast.error('Không cập nhật được đặt bàn', {
        description: result.error,
      })
    },
    [closeEdit, editReservation],
  )

  const handleEditCancelBooking = useCallback(
    async (id: string) => {
      const reservation = editingReservation || reservations.find((item) => item.id === id)
      if (!reservation) return

      handleCancel(reservation)
      closeEdit()
    },
    [closeEdit, editingReservation, handleCancel, reservations],
  )

  const handleUpdateStatus = useCallback(
    async (reservation: Reservation, status: ReservationStatus) => {
      setUpdatingStatusId(reservation.id)
      const result = await updateReservationStatus(reservation.id, status)
      setUpdatingStatusId(null)
      
      if (result.ok) {
        toast.success(`Đã cập nhật trạng thái của ${reservation.name}`)
        return true
      }

      toast.error('Không cập nhật được trạng thái', {
        description: result.error,
      })
      return false
    },
    [updateReservationStatus],
  )

  return {
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
  }
}
