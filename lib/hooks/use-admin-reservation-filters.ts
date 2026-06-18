'use client'

import { useMemo, useState } from 'react'

import { useDebounce } from '@/lib/hooks/use-debounce'
import type { Reservation, ReservationStatus } from '@/lib/reservation-types'

export type AdminFilter = 'all' | ReservationStatus
export type AdminView = 'reservations' | 'calendar'

function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useAdminReservationFilters(reservations: Reservation[]) {
  const [view, setView] = useState<AdminView>('reservations')
  const [filter, setFilter] = useState<AdminFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState(todayISO())

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const counts = useMemo(
    () => ({
      all: reservations.length,
      pending: reservations.filter((reservation) => reservation.status === 'pending').length,
      confirmed: reservations.filter((reservation) => reservation.status === 'confirmed').length,
      cancelled: reservations.filter((reservation) => reservation.status === 'cancelled').length,
    }),
    [reservations],
  )

  const filtered = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase()

    return reservations
      .filter((reservation) => {
        if (filter !== 'all' && reservation.status !== filter) return false
        if (dateFilter && reservation.date !== dateFilter) return false
        if (!normalizedSearch) return true

        return (
          reservation.name.toLowerCase().includes(normalizedSearch) ||
          reservation.phone.toLowerCase().includes(normalizedSearch) ||
          (reservation.table?.code.toLowerCase() ?? '').includes(normalizedSearch)
        )
      })
      .sort((a, b) => {
        const createdAtCompare = b.createdAt - a.createdAt
        if (createdAtCompare !== 0) return createdAtCompare
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.time.localeCompare(b.time)
      })
  }, [reservations, filter, debouncedSearchTerm, dateFilter])

  return {
    view,
    setView,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    isDateFilterOpen,
    setIsDateFilterOpen,
    calendarDate,
    setCalendarDate,
    counts,
    filtered,
  }
}
