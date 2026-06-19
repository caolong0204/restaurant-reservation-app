'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'

import {
  cancelReservation as cancelReservationAction,
  confirmReservation as confirmReservationAction,
  createManualReservation as createManualReservationAction,
  createReservation as createReservationAction,
  deleteReservation as deleteReservationAction,
  editReservation as editReservationAction,
  updateReservationStatus as updateReservationStatusAction,
  getAdminSnapshot,
  getAvailableTables as getAvailableTablesAction,
} from '@/lib/reservation-actions'
import { createClient } from '@/lib/supabase/client'
import type {
  ActionResult,
  Reservation,
  ReservationInput,
  ReservationStatus,
  RestaurantTable,
} from '@/lib/reservation-types'

export type {
  ActionResult,
  Reservation,
  ReservationInput,
  ReservationStatus,
  RestaurantTable,
  SlotAvailability,
} from '@/lib/reservation-types'

type ReservationContextValue = {
  reservations: Reservation[]
  tables: RestaurantTable[]
  isLoading: boolean
  refreshAdminData: (silent?: boolean) => Promise<void>
  addReservation: (data: ReservationInput) => Promise<ActionResult<Reservation>>
  createManualReservation: (data: ReservationInput) => Promise<ActionResult<Reservation>>
  confirmReservation: (
    id: string,
    tableId: string,
    secondaryTableIds?: string[],
    manualArrangement?: boolean,
  ) => Promise<ActionResult<Reservation>>
  cancelReservation: (id: string) => Promise<ActionResult<Reservation>>
  editReservation: (id: string, data: ReservationInput) => Promise<ActionResult<Reservation>>
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<ActionResult<Reservation>>
  deleteReservation: (id: string) => Promise<ActionResult<string>>
  getAvailableTables: (
    date: string,
    time: string,
    partySize: number,
    excludingReservationId?: string,
  ) => Promise<ActionResult<RestaurantTable[]>>
}

const ReservationContext = createContext<ReservationContextValue | null>(null)

function upsertReservation(list: Reservation[], next: Reservation): Reservation[] {
  const exists = list.some((reservation) => reservation.id === next.id)
  if (!exists) return [next, ...list]

  return list.map((reservation) => (reservation.id === next.id ? next : reservation))
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [isLoading, setIsLoading] = useState(() => pathname === '/admin')

  const refreshAdminData = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true)

    const result = await getAdminSnapshot()
    if (result.ok) {
      setReservations(result.data.reservations)
      setTables(result.data.tables)
    }
    if (!silent) setIsLoading(false)
  }, [])

  useEffect(() => {
    if (pathname === '/admin') {
      void refreshAdminData()
      
      const supabase = createClient()
      let channel: any

      supabase.auth.getSession().then(() => {
        channel = supabase
          .channel('admin-reservations')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reservations' },
            (payload) => {
              console.log('Realtime payload received:', payload)
              if (payload.eventType === 'INSERT') {
                const newRes = payload.new as any
                if (newRes.status === 'pending') {
                  toast.info(`🔔 Khách hàng ${newRes.guest_name || 'mới'} vừa đặt bàn!`, {
                    description: `${newRes.party_size} người lúc ${newRes.reservation_time} ngày ${newRes.reservation_date}`,
                    duration: 5000,
                  })
                }
              }
              // Lặng lẽ tải lại dữ liệu mà không bật loading state (tránh giật UI)
              void refreshAdminData(true)
            }
          )
          .subscribe((status, err) => {
            if (err) console.error('Realtime subscription error:', err)
            else console.log('Realtime subscription status:', status)
          })
      })
        
      return () => {
        if (channel) void supabase.removeChannel(channel)
      }
    }
  }, [pathname, refreshAdminData])

  const addReservation = useCallback(async (data: ReservationInput) => {
    const result = await createReservationAction(data)
    if (result.ok && pathname === '/admin') {
      setReservations((prev) => upsertReservation(prev, result.data))
    }
    return result
  }, [pathname])

  const createManualReservation = useCallback(async (data: ReservationInput) => {
    const result = await createManualReservationAction(data)
    if (result.ok) {
      setReservations((prev) => upsertReservation(prev, result.data))
    }
    return result
  }, [])

  const confirmReservation = useCallback(async (
    id: string,
    tableId: string,
    secondaryTableIds?: string[],
    manualArrangement?: boolean,
  ) => {
    const result = await confirmReservationAction(id, tableId, secondaryTableIds, manualArrangement)
    if (result.ok) {
      setReservations((prev) => upsertReservation(prev, result.data))
    }
    return result
  }, [])

  const cancelReservation = useCallback(async (id: string) => {
    const result = await cancelReservationAction(id)
    if (result.ok) {
      setReservations((prev) => upsertReservation(prev, result.data))
    }
    return result
  }, [])

  const editReservation = useCallback(async (id: string, data: ReservationInput) => {
    const result = await editReservationAction(id, data)
    if (result.ok) {
      setReservations((prev) => upsertReservation(prev, result.data))
    }
    return result
  }, [])

  const updateReservationStatus = useCallback(async (id: string, status: ReservationStatus) => {
    const result = await updateReservationStatusAction(id, status)
    if (result.ok) {
      setReservations((prev) => upsertReservation(prev, result.data))
    }
    return result
  }, [])

  const deleteReservation = useCallback(async (id: string) => {
    const result = await deleteReservationAction(id)
    if (result.ok) {
      setReservations((prev) => prev.filter((reservation) => reservation.id !== id))
    }
    return result
  }, [])

  const getAvailableTables = useCallback(
    (
      date: string,
      time: string,
      partySize: number,
      excludingReservationId?: string,
    ) => getAvailableTablesAction(date, time, partySize, excludingReservationId),
    [],
  )

  const value = useMemo(
    () => ({
      reservations,
      tables,
      isLoading,
      refreshAdminData,
      addReservation,
      createManualReservation,
      confirmReservation,
      cancelReservation,
      editReservation,
      updateReservationStatus,
      deleteReservation,
      getAvailableTables,
    }),
    [
      reservations,
      tables,
      isLoading,
      refreshAdminData,
      addReservation,
      createManualReservation,
      confirmReservation,
      cancelReservation,
      editReservation,
      updateReservationStatus,
      deleteReservation,
      getAvailableTables,
    ],
  )

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  )
}

export function useReservations() {
  const ctx = useContext(ReservationContext)
  if (!ctx) {
    throw new Error('useReservations must be used within a ReservationProvider')
  }
  return ctx
}
