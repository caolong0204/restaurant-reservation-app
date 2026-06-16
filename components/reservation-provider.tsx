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

import {
  cancelReservation as cancelReservationAction,
  confirmReservation as confirmReservationAction,
  createManualReservation as createManualReservationAction,
  createReservation as createReservationAction,
  deleteReservation as deleteReservationAction,
  editReservation as editReservationAction,
  getAdminSnapshot,
  getAvailableTables as getAvailableTablesAction,
} from '@/lib/reservation-actions'
import type {
  ActionResult,
  Reservation,
  ReservationInput,
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
  actionError: string | null
  authMode: 'supabase' | 'demo'
  refreshAdminData: () => Promise<void>
  addReservation: (data: ReservationInput) => Promise<ActionResult<Reservation>>
  createManualReservation: (data: ReservationInput) => Promise<ActionResult<Reservation>>
  confirmReservation: (id: string, tableId: string) => Promise<ActionResult<Reservation>>
  cancelReservation: (id: string) => Promise<ActionResult<Reservation>>
  editReservation: (id: string, data: ReservationInput) => Promise<ActionResult<Reservation>>
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
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'supabase' | 'demo'>('demo')

  const refreshAdminData = useCallback(async () => {
    setIsLoading(true)
    setActionError(null)

    const result = await getAdminSnapshot()
    if (result.ok) {
      setReservations(result.data.reservations)
      setTables(result.data.tables)
      setAuthMode(result.data.authMode)
    } else {
      setActionError(result.error)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (pathname === '/admin') {
      void refreshAdminData()
    }
  }, [pathname, refreshAdminData])

  const addReservation = useCallback(async (data: ReservationInput) => {
    const result = await createReservationAction(data)
    if (result.ok && pathname === '/admin') {
      setReservations((prev) => upsertReservation(prev, result.data))
    }
    if (!result.ok) setActionError(result.error)
    return result
  }, [pathname])

  const createManualReservation = useCallback(async (data: ReservationInput) => {
    const result = await createManualReservationAction(data)
    if (result.ok) {
      setReservations((prev) => upsertReservation(prev, result.data))
    } else {
      setActionError(result.error)
    }
    return result
  }, [])

  const confirmReservation = useCallback(async (id: string, tableId: string) => {
    const result = await confirmReservationAction(id, tableId)
    if (result.ok) {
      setReservations((prev) => upsertReservation(prev, result.data))
    } else {
      setActionError(result.error)
    }
    return result
  }, [])

  const cancelReservation = useCallback(async (id: string) => {
    const result = await cancelReservationAction(id)
    if (result.ok) {
      setReservations((prev) => upsertReservation(prev, result.data))
    } else {
      setActionError(result.error)
    }
    return result
  }, [])

  const editReservation = useCallback(async (id: string, data: ReservationInput) => {
    const result = await editReservationAction(id, data)
    if (result.ok) {
      setReservations((prev) => upsertReservation(prev, result.data))
    } else {
      setActionError(result.error)
    }
    return result
  }, [])

  const deleteReservation = useCallback(async (id: string) => {
    const result = await deleteReservationAction(id)
    if (result.ok) {
      setReservations((prev) => prev.filter((reservation) => reservation.id !== id))
    } else {
      setActionError(result.error)
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
      actionError,
      authMode,
      refreshAdminData,
      addReservation,
      createManualReservation,
      confirmReservation,
      cancelReservation,
      editReservation,
      deleteReservation,
      getAvailableTables,
    }),
    [
      reservations,
      tables,
      isLoading,
      actionError,
      authMode,
      refreshAdminData,
      addReservation,
      createManualReservation,
      confirmReservation,
      cancelReservation,
      editReservation,
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
