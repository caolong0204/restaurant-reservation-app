'use client'

import { useEffect, useMemo, useState } from 'react'

import { useDebounce } from '@/lib/hooks/use-debounce'
import type { Reservation } from '@/lib/reservation-types'

export type AdminFilter = 'all' | 'pending' | 'confirmed' | 'serving' | 'completed' | 'cancelled'
export type AdminView = 'reservations' | 'calendar'
const DEFAULT_RESERVATIONS_PAGE_SIZE = 10

function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useAdminReservationFilters(reservations: Reservation[]) {
  const [filter, setFilter] = useState<AdminFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = DEFAULT_RESERVATIONS_PAGE_SIZE

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const counts = useMemo(() => {
    const today = todayISO()
    const relevantReservations = reservations.filter(r => {
      if (dateFilter) return r.date === dateFilter
      return r.date >= today
    })
    return {
      all: relevantReservations.length,
      pending: relevantReservations.filter((reservation) => reservation.status === 'pending').length,
      confirmed: relevantReservations.filter((reservation) => reservation.status === 'confirmed').length,
      serving: relevantReservations.filter((reservation) => reservation.status === 'arrived' || reservation.status === 'seated').length,
      completed: relevantReservations.filter((reservation) => reservation.status === 'completed').length,
      cancelled: relevantReservations.filter((reservation) => reservation.status === 'cancelled' || reservation.status === 'no_show').length,
    }
  }, [reservations, dateFilter])

  const filtered = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase()

    return reservations
      .filter((reservation) => {
        if (filter !== 'all') {
          if (filter === 'serving' && !['arrived', 'seated'].includes(reservation.status)) return false
          if (filter === 'cancelled' && !['cancelled', 'no_show'].includes(reservation.status)) return false
          if (filter !== 'serving' && filter !== 'cancelled' && reservation.status !== filter) return false
        }
        
        const today = todayISO()
        if (dateFilter) {
          if (reservation.date !== dateFilter) return false
        } else {
          if (reservation.date < today) return false
        }
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, debouncedSearchTerm, dateFilter])

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage)
    }
  }, [currentPage, safeCurrentPage])

  return {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    isDateFilterOpen,
    setIsDateFilterOpen,
    currentPage: safeCurrentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    counts,
    filtered,
  }
}
