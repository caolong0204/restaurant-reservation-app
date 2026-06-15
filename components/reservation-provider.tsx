'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export type Reservation = {
  id: string
  name: string
  email: string
  phone: string
  /** ISO date string, e.g. 2026-06-20 */
  date: string
  /** e.g. 19:30 */
  time: string
  partySize: number
  occasion?: string
  notes?: string
  status: ReservationStatus
  createdAt: number
}

type NewReservation = Omit<Reservation, 'id' | 'status' | 'createdAt'>

type ReservationContextValue = {
  reservations: Reservation[]
  addReservation: (data: NewReservation) => Reservation
  updateStatus: (id: string, status: ReservationStatus) => void
}

const ReservationContext = createContext<ReservationContextValue | null>(null)

function todayPlus(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const SEED: Reservation[] = [
  {
    id: 'res_1001',
    name: 'Amelia Chen',
    email: 'amelia.chen@example.com',
    phone: '(415) 555-0142',
    date: todayPlus(0),
    time: '19:00',
    partySize: 2,
    occasion: 'Anniversary',
    notes: 'Quiet corner table if possible.',
    status: 'confirmed',
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
  },
  {
    id: 'res_1002',
    name: 'Marcus Webb',
    email: 'marcus.webb@example.com',
    phone: '(415) 555-0188',
    date: todayPlus(0),
    time: '20:30',
    partySize: 4,
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'res_1003',
    name: 'Sofia Romano',
    email: 'sofia.r@example.com',
    phone: '(415) 555-0123',
    date: todayPlus(1),
    time: '18:30',
    partySize: 6,
    occasion: 'Birthday',
    notes: 'Bringing a cake — please hold until dessert.',
    status: 'confirmed',
    createdAt: Date.now() - 1000 * 60 * 60 * 50,
  },
  {
    id: 'res_1004',
    name: 'Daniel Okoro',
    email: 'd.okoro@example.com',
    phone: '(415) 555-0199',
    date: todayPlus(2),
    time: '21:00',
    partySize: 2,
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'res_1005',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '(415) 555-0177',
    date: todayPlus(3),
    time: '19:30',
    partySize: 3,
    occasion: 'Business dinner',
    status: 'cancelled',
    createdAt: Date.now() - 1000 * 60 * 60 * 70,
  },
]

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(SEED)

  const addReservation = useCallback((data: NewReservation) => {
    const reservation: Reservation = {
      ...data,
      id: `res_${Math.random().toString(36).slice(2, 8)}`,
      status: 'pending',
      createdAt: Date.now(),
    }
    setReservations((prev) => [reservation, ...prev])
    return reservation
  }, [])

  const updateStatus = useCallback((id: string, status: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    )
  }, [])

  const value = useMemo(
    () => ({ reservations, addReservation, updateStatus }),
    [reservations, addReservation, updateStatus],
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
