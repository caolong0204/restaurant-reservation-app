'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import type { RealtimeChannel } from '@supabase/supabase-js'

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
import { mapReservation } from '@/lib/reservations/mappers'
import type { ReservationRow } from '@/lib/reservations/types'

export type {
  ActionResult,
  Reservation,
  ReservationInput,
  ReservationStatus,
  RestaurantTable,
  SlotAvailability,
} from '@/lib/reservation-types'

// 1. State Context
type ReservationStateValue = {
  reservations: Reservation[]
  tables: RestaurantTable[]
  isLoading: boolean
}

// 2. Dispatch/Actions Context
type ReservationDispatchValue = {
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

const ReservationStateContext = createContext<ReservationStateValue | null>(null)
const ReservationDispatchContext = createContext<ReservationDispatchValue | null>(null)

function upsertReservation(list: Reservation[], next: Reservation): Reservation[] {
  const exists = list.some((reservation) => reservation.id === next.id)
  if (!exists) return [next, ...list]

  return list.map((reservation) => (reservation.id === next.id ? next : reservation))
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [isLoading, setIsLoading] = useState(() => isAdmin)

  // Giữ tham chiếu mới nhất của tables để Realtime callback không bị stale closure và không gây re-subscribe
  const tablesRef = useRef<RestaurantTable[]>(tables)
  useEffect(() => {
    tablesRef.current = tables
  }, [tables])

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
    if (isAdmin) {
      void refreshAdminData()
      
      const supabase = createClient()
      let channel: RealtimeChannel | null = null

      supabase.auth.getSession().then(() => {
        channel = supabase
          .channel('admin-reservations')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reservations' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const row = payload.new as ReservationRow
                if (row.status === 'pending') {
                  toast.info(`🔔 Khách hàng ${row.guest_name || 'mới'} vừa đặt bàn!`, {
                    description: `${row.party_size} người lúc ${row.reservation_time} ngày ${row.reservation_date}`,
                    duration: 5000,
                  })
                }
                
                // Tránh over-fetching: Map trực tiếp dữ liệu mới và đẩy vào mảng state hiện tại
                const newReservation = mapReservation(row, tablesRef.current)
                setReservations((prev) => upsertReservation(prev, newReservation))
              }
            }
          )
          .subscribe((status, err) => {
            if (err) console.error('Realtime subscription error:', err)
          })
      })
        
      return () => {
        if (channel) void supabase.removeChannel(channel)
      }
    }
  }, [isAdmin, refreshAdminData])

  const addReservation = useCallback(async (data: ReservationInput) => {
    const result = await createReservationAction(data)
    if (result.ok && isAdmin) {
      setReservations((prev) => upsertReservation(prev, result.data))
    }
    return result
  }, [isAdmin])

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

  const stateValue = useMemo(
    () => ({ reservations, tables, isLoading }),
    [reservations, tables, isLoading]
  )

  const dispatchValue = useMemo(
    () => ({
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
      refreshAdminData,
      addReservation,
      createManualReservation,
      confirmReservation,
      cancelReservation,
      editReservation,
      updateReservationStatus,
      deleteReservation,
      getAvailableTables,
    ]
  )

  return (
    <ReservationStateContext.Provider value={stateValue}>
      <ReservationDispatchContext.Provider value={dispatchValue}>
        {children}
      </ReservationDispatchContext.Provider>
    </ReservationStateContext.Provider>
  )
}

export function useReservationState() {
  const ctx = useContext(ReservationStateContext)
  if (!ctx) throw new Error('useReservationState must be used within a ReservationProvider')
  return ctx
}

export function useReservationDispatch() {
  const ctx = useContext(ReservationDispatchContext)
  if (!ctx) throw new Error('useReservationDispatch must be used within a ReservationProvider')
  return ctx
}
