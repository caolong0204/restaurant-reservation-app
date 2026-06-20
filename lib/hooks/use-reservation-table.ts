'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  sortReservations,
  type ReservationSortField,
  type ReservationSortOrder,
} from '@/components/admin/reservation-table-utils'
import { getTodayIso } from '@/lib/admin-calendar'
import type { Reservation } from '@/lib/reservation-types'

export function useReservationTable({
  reservations,
  currentPage,
  pageSize,
  rowSlots,
}: {
  reservations: Reservation[]
  currentPage: number
  pageSize: number
  rowSlots: number
}) {
  const [sortField, setSortField] = useState<ReservationSortField | null>('createdAt')
  const [sortOrder, setSortOrder] = useState<ReservationSortOrder | null>('desc')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [nowMs, setNowMs] = useState<number | null>(null)
  const todayStr = useMemo(() => getTodayIso(), [])

  useEffect(() => {
    setIsMounted(true)
    const updateTime = () => setNowMs(Date.now())
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleSort = useCallback((field: ReservationSortField) => {
    setSortField((currentField) => {
      if (currentField !== field) {
        setSortOrder('asc')
        return field
      }

      setSortOrder((currentOrder) => (currentOrder === 'asc' ? 'desc' : 'asc'))
      return currentField
    })
  }, [])

  const displayReservations = useMemo(
    () => sortReservations(reservations, sortField, sortOrder),
    [reservations, sortField, sortOrder],
  )
  const startIndex = (currentPage - 1) * pageSize
  const visibleReservations = useMemo(
    () => displayReservations.slice(startIndex, startIndex + pageSize),
    [displayReservations, pageSize, startIndex],
  )
  const placeholderRows = Math.max(0, rowSlots - visibleReservations.length)

  return {
    sortField,
    sortOrder,
    selectedReservation,
    setSelectedReservation,
    isMounted,
    nowMs: nowMs ?? 0,
    todayStr: todayStr || '2000-01-01',
    startIndex,
    visibleReservations,
    placeholderRows,
    handleSort,
  }
}
