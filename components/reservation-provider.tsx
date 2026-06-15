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
  tableLocation?: string
  notes?: string
  status: ReservationStatus
  createdAt: number
}

type NewReservation = Omit<Reservation, 'id' | 'status' | 'createdAt'>

type ReservationContextValue = {
  reservations: Reservation[]
  addReservation: (data: NewReservation) => Reservation
  updateStatus: (id: string, status: ReservationStatus) => void
  editReservation: (id: string, updatedData: Partial<Reservation>) => void
  deleteReservation: (id: string) => void
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
    name: 'Nguyễn Văn Anh',
    email: 'vananh.nguyen@example.com',
    phone: '0901234567',
    date: todayPlus(0),
    time: '19:00',
    partySize: 2,
    occasion: 'Kỷ niệm',
    tableLocation: 'Tầng 1',
    notes: 'Bàn góc yên tĩnh cạnh cửa sổ nếu có thể.',
    status: 'confirmed',
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
  },
  {
    id: 'res_1002',
    name: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    phone: '0912345678',
    date: todayPlus(0),
    time: '20:30',
    partySize: 4,
    tableLocation: 'Tầng 2',
    notes: 'Chuẩn bị giúp một ghế trẻ em.',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'res_1003',
    name: 'Lê Hoàng Nam',
    email: 'nam.lehoang@example.com',
    phone: '0987654321',
    date: todayPlus(1),
    time: '18:30',
    partySize: 6,
    occasion: 'Hẹn hò',
    tableLocation: 'Tầng 1',
    notes: 'Có mang theo bánh kem sinh nhật nhờ nhà hàng giữ lạnh hộ.',
    status: 'confirmed',
    createdAt: Date.now() - 1000 * 60 * 60 * 50,
  },
  {
    id: 'res_1004',
    name: 'Phạm Minh Đức',
    email: 'duc.pham@example.com',
    phone: '0345678912',
    date: todayPlus(2),
    time: '21:00',
    partySize: 2,
    tableLocation: 'Tầng 2',
    notes: 'Khách bị dị ứng với các loại hạt.',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'res_1005',
    name: 'Vũ Mỹ Linh',
    email: 'mylinh.vu@example.com',
    phone: '0765432109',
    date: todayPlus(3),
    time: '19:30',
    partySize: 3,
    occasion: 'Tiệc xã giao/công việc',
    tableLocation: 'Tầng 1',
    notes: 'Cần hóa đơn VAT sau khi thanh toán.',
    status: 'cancelled',
    createdAt: Date.now() - 1000 * 60 * 60 * 70,
  },
]

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(SEED)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('reservations')
      if (stored) {
        try {
          setReservations(JSON.parse(stored))
        } catch (e) {
          // ignore error
        }
      } else {
        localStorage.setItem('reservations', JSON.stringify(SEED))
      }
    }
  }, [])

  const addReservation = useCallback((data: NewReservation) => {
    const reservation: Reservation = {
      ...data,
      id: `res_${Math.random().toString(36).slice(2, 8)}`,
      status: 'pending',
      createdAt: Date.now(),
    }
    setReservations((prev) => {
      const next = [reservation, ...prev]
      if (typeof window !== 'undefined') {
        localStorage.setItem('reservations', JSON.stringify(next))
      }
      return next
    })
    return reservation
  }, [])

  const updateStatus = useCallback((id: string, status: ReservationStatus) => {
    setReservations((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r))
      if (typeof window !== 'undefined') {
        localStorage.setItem('reservations', JSON.stringify(next))
      }
      return next
    })
  }, [])

  const editReservation = useCallback((id: string, updatedData: Partial<Reservation>) => {
    setReservations((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r))
      if (typeof window !== 'undefined') {
        localStorage.setItem('reservations', JSON.stringify(next))
      }
      return next
    })
  }, [])

  const deleteReservation = useCallback((id: string) => {
    setReservations((prev) => {
      const next = prev.filter((r) => r.id !== id)
      if (typeof window !== 'undefined') {
        localStorage.setItem('reservations', JSON.stringify(next))
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ reservations, addReservation, updateStatus, editReservation, deleteReservation }),
    [reservations, addReservation, updateStatus, editReservation, deleteReservation],
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
