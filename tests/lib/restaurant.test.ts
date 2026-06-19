import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  getAvailableTimeSlots,
  getClosingTime,
  getLastBookingTime,
  isPastTimeSlot,
  isTodayDate,
} from '@/lib/restaurant'

describe('restaurant booking rules', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('uses 22:00 closing time on weekdays', () => {
    expect(getClosingTime('2026-06-18')).toBe('22:00')
    expect(getLastBookingTime('2026-06-18')).toBe('21:00')
  })

  test('uses 22:30 closing time on Friday and weekend', () => {
    expect(getClosingTime('2026-06-19')).toBe('22:30')
    expect(getClosingTime('2026-06-20')).toBe('22:30')
    expect(getClosingTime('2026-06-21')).toBe('22:30')
    expect(getLastBookingTime('2026-06-21')).toBe('21:30')
  })

  test('returns only slots that fit before weekday cutoff', () => {
    const slots = getAvailableTimeSlots(4, '2026-06-18')

    expect(slots[0]).toBe('10:30')
    expect(slots.at(-1)).toBe('21:00')
    expect(slots).not.toContain('21:15')
    expect(slots).not.toContain('21:30')
    expect(slots).not.toContain('21:45')
    expect(slots).not.toContain('22:00')
  })

  test('returns only slots that fit before weekend cutoff', () => {
    const slots = getAvailableTimeSlots(4, '2026-06-21')

    expect(slots.at(-1)).toBe('21:30')
    expect(slots).not.toContain('21:45')
    expect(slots).not.toContain('22:00')
    expect(slots).not.toContain('22:15')
    expect(slots).not.toContain('22:30')
  })

  test('detects current restaurant date in Asia/Ho_Chi_Minh', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18T12:00:00+07:00'))

    expect(isTodayDate('2026-06-18')).toBe(true)
    expect(isTodayDate('2026-06-17')).toBe(false)
  })

  test('disables time slots in the past for the current date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18T18:20:00+07:00'))

    expect(isPastTimeSlot('18:15', '2026-06-18')).toBe(true)
    expect(isPastTimeSlot('18:30', '2026-06-18')).toBe(false)
    expect(isPastTimeSlot('18:15', '2026-06-19')).toBe(false)
  })

  test('returns empty array for Monday', () => {
    // 2026-06-15 is a Monday
    const slots = getAvailableTimeSlots(4, '2026-06-15')
    expect(slots).toEqual([])
  })
})
