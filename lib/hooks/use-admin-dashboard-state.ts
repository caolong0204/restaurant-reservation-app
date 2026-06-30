'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useReservationDispatch, useReservationState } from '@/components/reservation-provider'
import { getTodayIso } from '@/lib/admin-calendar'
import { useAdminReservationActions } from '@/lib/hooks/use-admin-reservation-actions'
import type { AdminView } from '@/lib/hooks/use-admin-reservation-filters'
import type { Reservation, RestaurantTable } from '@/lib/reservation-types'

export function useAdminDashboardState({
  canManageSettings,
  initialReservations,
  initialTables,
}: {
  canManageSettings: boolean
  initialReservations: Reservation[]
  initialTables: RestaurantTable[]
}) {
  const { reservations, tables, isLoading } = useReservationState()
  const dispatch = useReservationDispatch()
  const [view, setView] = useState<AdminView>('reservations')
  const [calendarDate, setCalendarDate] = useState(getTodayIso)

  const visibleTables = useMemo(
    () => (tables.length > 0 ? tables : initialTables),
    [initialTables, tables],
  )
  const visibleReservations = useMemo(
    () => (tables.length > 0 ? reservations : initialReservations),
    [initialReservations, reservations, tables.length],
  )
  const activeTables = useMemo(
    () => visibleTables.filter((table) => table.availabilityStatus === 'active'),
    [visibleTables],
  )

  const setAdminView = useCallback(
    (nextView: AdminView) => {
      if ((nextView === 'settings' || nextView === 'accounts') && !canManageSettings) return
      setView(nextView)
    },
    [canManageSettings],
  )

  const lastViewRef = useRef(view)
  useEffect(() => {
    if (view !== lastViewRef.current) {
      void dispatch.refreshAdminData(true)
    }
    lastViewRef.current = view
  }, [view, dispatch])

  const pageCopy = useMemo(() => {
    if (view === 'reservations') {
      return {
        title: 'Danh sách đặt bàn',
        description: 'Theo dõi booking, trạng thái và thao tác gán bàn trong ngày.',
      }
    }
    if (view === 'calendar') {
      return {
        title: 'Lịch ngày',
        description: 'Theo dõi bàn, giờ phục vụ và lượt đặt trong ngày.',
      }
    }
    if (view === 'accounts') {
      return {
        title: 'Tài khoản',
        description: 'Tạo tài khoản nhân viên, đổi mật khẩu và quản lý quyền đăng nhập.',
      }
    }
    return {
      title: 'Cài đặt',
      description: 'Thiết lập bàn, giữ bàn walk-in và giờ hoạt động.',
    }
  }, [view])

  const reservationActions = useAdminReservationActions({
    reservations: visibleReservations,
    createManualReservation: dispatch.createManualReservation,
    confirmReservation: dispatch.confirmReservation,
    cancelReservation: dispatch.cancelReservation,
    editReservation: dispatch.editReservation,
    updateReservationStatus: dispatch.updateReservationStatus,
    getAvailableTables: dispatch.getAvailableTables,
  })

  const {
    setIsCreateOpen,
    openAssignModal,
    handleCancel,
    handleAssignConfirm,
    executeCancel,
  } = reservationActions
  const openCreateReservation = useCallback(() => {
    setIsCreateOpen(true)
  }, [setIsCreateOpen])
  const closeCreateReservation = useCallback(() => {
    setIsCreateOpen(false)
  }, [setIsCreateOpen])
  const openAssignReservation = useCallback(
    (reservation: Reservation) => {
      void openAssignModal(reservation)
    },
    [openAssignModal],
  )
  const cancelReservation = useCallback(
    (reservation: Reservation) => {
      handleCancel(reservation)
    },
    [handleCancel],
  )
  const confirmAssignedTable = useCallback(
    (tableId: string, secondaryTableIds: string[] = [], manualArrangement = false) =>
      handleAssignConfirm(tableId, secondaryTableIds, manualArrangement),
    [handleAssignConfirm],
  )
  const executeCancelReservation = useCallback(() => {
    void executeCancel()
  }, [executeCancel])
  const refresh = useCallback(() => {
    void dispatch.refreshAdminData()
  }, [dispatch])

  return {
    view,
    calendarDate,
    setCalendarDate,
    setAdminView,
    pageTitle: pageCopy.title,
    pageDescription: pageCopy.description,
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
    refreshAdminData: dispatch.refreshAdminData,
    getAvailableTables: dispatch.getAvailableTables,
    reservationActions,
  }
}

export type AdminDashboardState = ReturnType<typeof useAdminDashboardState>
