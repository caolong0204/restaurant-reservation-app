import { TIME_SLOTS } from '@/lib/restaurant'
import { getBookingDurationMinutes, type Reservation, type ReservationInput, type ReservationStatus, type RestaurantTable, type SlotAvailability } from '@/lib/reservation-types'
import { DEFAULT_TABLES } from '@/lib/table-seed'

type DemoStore = {
  reservations: Reservation[]
  tables: RestaurantTable[]
}

declare global {
  var __flambeDemoStoreV5: DemoStore | undefined
}

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function nowMinus(hours: number): number {
  return Date.now() - 1000 * 60 * 60 * hours
}

function withTable(reservation: Omit<Reservation, 'table' | 'secondaryTables'> & { secondaryTableIds?: string[] }): Reservation {
  const table = reservation.tableId
    ? DEFAULT_TABLES.find((item) => item.id === reservation.tableId)
    : undefined

  const secondaryTableIds = reservation.secondaryTableIds ?? []
  const secondaryTables = secondaryTableIds
    .map((id) => DEFAULT_TABLES.find((item) => item.id === id))
    .filter((t): t is RestaurantTable => !!t)

  return {
    ...reservation,
    table,
    secondaryTableIds,
    secondaryTables,
  }
}

const DEMO_RESERVATIONS: Reservation[] = [
  withTable({
    id: 'res_1001',
    name: 'Nguyễn Văn Anh',
    email: 'vananh.nguyen@example.com',
    phone: '0901234567',
    date: todayPlus(0),
    time: '19:00',
    partySize: 2,
    occasion: 'Kỷ niệm',
    tableLocation: 'Tầng 1',
    notes: 'Kỷ niệm ngày cưới, mong nhà hàng chuẩn bị hoa.',
    status: 'confirmed',
    tableId: 'tbl_03',
    createdAt: nowMinus(30),
    updatedAt: nowMinus(2),
  }),
  withTable({
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
    createdAt: nowMinus(5),
    updatedAt: nowMinus(5),
  }),
  withTable({
    id: 'res_1006',
    name: 'Phạm Minh Đức',
    email: 'duc.pham@example.com',
    phone: '0933334444',
    date: todayPlus(0),
    time: '11:15',
    partySize: 4,
    tableLocation: 'Tầng 1',
    notes: 'Booking 120 phút (bắt đầu 11:15).',
    status: 'confirmed',
    tableId: 'tbl_04',
    createdAt: nowMinus(10),
    updatedAt: nowMinus(1),
  }),
  withTable({
    id: 'res_1007',
    name: 'Hoàng Lan',
    email: 'lan.hoang@example.com',
    phone: '0988776655',
    date: todayPlus(0),
    time: '12:30',
    partySize: 6,
    tableLocation: 'Tầng 1',
    notes: 'Booking 150 phút (bắt đầu 12:30).',
    status: 'confirmed',
    tableId: 'tbl_01',
    createdAt: nowMinus(20),
    updatedAt: nowMinus(2),
  }),
  withTable({
    id: 'res_1008',
    name: 'Võ Thành Đạt',
    email: 'dat.vo@example.com',
    phone: '0900112233',
    date: todayPlus(0),
    time: '13:45',
    partySize: 8,
    tableLocation: 'Tầng 1',
    notes: 'Booking 180 phút (bắt đầu 13:45).',
    status: 'confirmed',
    tableId: 'tbl_08',
    secondaryTableIds: ['tbl_01'],
    createdAt: nowMinus(40),
    updatedAt: nowMinus(3),
  }),
  withTable({
    id: 'res_1003',
    name: 'Lê Hoàng Nam',
    email: 'nam.lehoang@example.com',
    phone: '0987654321',
    date: todayPlus(0),
    time: '18:30',
    partySize: 6,
    occasion: 'Hẹn hò',
    tableLocation: 'Tầng 1',
    notes: 'Có mang theo bánh kem sinh nhật nhờ nhà hàng giữ lạnh hộ.',
    status: 'confirmed',
    tableId: 'tbl_06',
    createdAt: nowMinus(50),
    updatedAt: nowMinus(24),
  }),
  withTable({
    id: 'res_1004',
    name: 'Phạm Minh Đức',
    email: 'duc.pham@example.com',
    phone: '0345678912',
    date: todayPlus(0),
    time: '21:00',
    partySize: 2,
    tableLocation: 'Tầng 2',
    notes: 'Khách bị dị ứng với các loại hạt.',
    status: 'pending',
    createdAt: nowMinus(2),
    updatedAt: nowMinus(2),
  }),
  withTable({
    id: 'res_1005',
    name: 'Vũ Mỹ Linh',
    email: 'mylinh.vu@example.com',
    phone: '0765432109',
    date: todayPlus(0),
    time: '19:30',
    partySize: 3,
    occasion: 'Tiệc xã giao/công việc',
    tableLocation: 'Tầng 1',
    notes: 'Cần hóa đơn VAT sau khi thanh toán.',
    status: 'cancelled',
    createdAt: nowMinus(70),
    updatedAt: nowMinus(68),
  }),
]

function getStore(): DemoStore {
  if (!globalThis.__flambeDemoStoreV5) {
    globalThis.__flambeDemoStoreV5 = {
      reservations: [...DEMO_RESERVATIONS],
      tables: [...DEFAULT_TABLES],
    }
  }

  return globalThis.__flambeDemoStoreV5
}

function minutesFromTime(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

function overlaps(aStart: string, aPartySize: number, bStart: string, bPartySize: number): boolean {
  const a = minutesFromTime(aStart)
  const b = minutesFromTime(bStart)
  const aDuration = getBookingDurationMinutes(aPartySize)
  const bDuration = getBookingDurationMinutes(bPartySize)
  return a < b + bDuration && b < a + aDuration
}

function attachTables(reservations: Reservation[]): Reservation[] {
  const { tables } = getStore()
  return reservations.map((reservation) => {
    const table = reservation.tableId
      ? tables.find((item) => item.id === reservation.tableId)
      : undefined
    const secondaryTableIds = reservation.secondaryTableIds ?? []
    const secondaryTables = secondaryTableIds
      .map((id) => tables.find((item) => item.id === id))
      .filter((t): t is RestaurantTable => !!t)

    return {
      ...reservation,
      table,
      secondaryTableIds,
      secondaryTables,
    }
  })
}

export function listDemoReservations(): Reservation[] {
  return attachTables([...getStore().reservations]).sort((a, b) =>
    a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date),
  )
}

export function listDemoTables(): RestaurantTable[] {
  return [...getStore().tables].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getDemoAvailableTables(
  date: string,
  time: string,
  partySize: number,
  excludingReservationId?: string,
): RestaurantTable[] {
  const { reservations, tables } = getStore()
  return tables
    .filter((table) => table.active)
    .filter((table) =>
      !reservations.some((reservation) =>
        reservation.status === 'confirmed' &&
        (reservation.tableId === table.id || (reservation.secondaryTableIds && reservation.secondaryTableIds.includes(table.id))) &&
        reservation.id !== excludingReservationId &&
        reservation.date === date &&
        overlaps(reservation.time, reservation.partySize, time, partySize),
      ),
    )
    .sort((a, b) => (a.capacity === b.capacity ? a.sortOrder - b.sortOrder : a.capacity - b.capacity))
}

export function getDemoSlotAvailability(date: string, partySize: number): SlotAvailability[] {
  void partySize

  return TIME_SLOTS.map((time) => ({
    time,
    // When counting slot availability for display, we want to show all unoccupied tables, not just ones fitting the party
    availableCount: getDemoAvailableTables(date, time, 1).length,
  }))
}

export function createDemoReservation(input: ReservationInput, status: ReservationStatus = 'pending'): Reservation {
  const reservation: Reservation = {
    ...input,
    id: `res_${Math.random().toString(36).slice(2, 10)}`,
    status,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  getStore().reservations = [reservation, ...getStore().reservations]
  return reservation
}

export function updateDemoReservation(id: string, input: Partial<Reservation>): Reservation | null {
  let updated: Reservation | null = null

  getStore().reservations = getStore().reservations.map((reservation) => {
    if (reservation.id !== id) return reservation

    updated = {
      ...reservation,
      ...input,
      updatedAt: Date.now(),
    }
    return updated
  })

  return updated ? attachTables([updated])[0] : null
}

export function deleteDemoReservation(id: string): boolean {
  const before = getStore().reservations.length
  getStore().reservations = getStore().reservations.filter((reservation) => reservation.id !== id)
  return getStore().reservations.length !== before
}
