export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export type StaffRole = 'admin' | 'staff'

export type RestaurantTable = {
  id: string
  code: string
  floor: 'Tầng 1' | 'Tầng 2'
  area: string
  capacity: number
  active: boolean
  sortOrder: number
  notes?: string
}

export type Reservation = {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  partySize: number
  occasion?: string
  tableLocation?: string
  notes?: string
  status: ReservationStatus
  tableId?: string
  table?: RestaurantTable
  secondaryTableIds?: string[]
  secondaryTables?: RestaurantTable[]
  createdAt: number
  updatedAt: number
}

export type ReservationInput = {
  name: string
  email?: string
  phone: string
  date: string
  time: string
  partySize: number
  occasion?: string
  tableLocation?: string
  notes?: string
  tableId?: string
  secondaryTableIds?: string[]
  status?: ReservationStatus
}

export type SlotAvailability = {
  time: string
  availableCount: number
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export type AdminReservationFilters = {
  status?: ReservationStatus | 'all'
  search?: string
  date?: string
}

export function getBookingDurationMinutes(partySize: number): number {
  if (partySize <= 4) return 120; // 1–4 khách → 120 phút
  if (partySize <= 6) return 150; // 5–6 khách → 150 phút
  return 180; // 7+ → 180 phút (tuỳ chỉnh)
}
