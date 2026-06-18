import { describe, expect, test } from 'vitest'

import {
  HALF_SLOT_WIDTH,
  createHalfHourSlots,
  getReservationGridStyle,
  getSlotAvailability,
} from '@/lib/admin-calendar'
import type { Reservation } from '@/lib/reservation-types'

const baseReservation: Reservation = {
  id: 'r1',
  name: 'Test Guest',
  phone: '0900000000',
  date: '2026-06-18',
  time: '18:15',
  partySize: 4,
  status: 'confirmed',
  tableId: 't1',
  createdAt: 0,
  updatedAt: 0,
}

describe('admin calendar timeline math', () => {
  test('creates 30-minute slots ending at the last visible booking slot', () => {
    const weekdaySlots = createHalfHourSlots('2026-06-18')
    const weekendSlots = createHalfHourSlots('2026-06-21')

    expect(weekdaySlots[0]).toBe('10:00')
    expect(weekdaySlots.at(-1)).toBe('21:30')
    expect(weekendSlots.at(-1)).toBe('22:00')
  })

  test('places 15-minute start times halfway inside the 30-minute cell', () => {
    const slots = createHalfHourSlots('2026-06-18')
    const style = getReservationGridStyle(baseReservation, slots)

    expect(style).not.toBeNull()
    expect(style?.gridColumn).toBe('17 / 22')
    expect(style?.marginLeft).toBe(`${HALF_SLOT_WIDTH / 2}px`)
    expect(style?.marginRight).toBe(`${HALF_SLOT_WIDTH / 2}px`)
  })

  test('keeps right-side offset for bookings that end on :15', () => {
    const slots = createHalfHourSlots('2026-06-18')
    const style = getReservationGridStyle(
      {
        ...baseReservation,
        time: '18:00',
        partySize: 5, // 150 mins => ends 20:30, exact edge
      },
      slots,
    )

    expect(style?.gridColumn).toBe('17 / 22')
    expect(style?.marginLeft).toBe('0px')
    expect(style?.marginRight).toBe('0px')
  })

  test('counts occupied tables including secondary joined tables', () => {
    const reservations: Reservation[] = [
      {
        ...baseReservation,
        tableId: 't1',
        secondaryTableIds: ['t2'],
      },
      {
        ...baseReservation,
        id: 'r2',
        tableId: 't3',
        time: '19:00',
      },
      {
        ...baseReservation,
        id: 'r3',
        tableId: 't4',
        status: 'cancelled',
      },
    ]

    expect(getSlotAvailability('18:30', ['t1', 't2', 't3', 't4'], reservations)).toBe(2)
    expect(getSlotAvailability('19:30', ['t1', 't2', 't3', 't4'], reservations)).toBe(1)
  })
})
