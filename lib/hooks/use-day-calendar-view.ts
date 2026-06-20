'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  buildTimelineMetrics,
  createHalfHourSlots,
  getTodayIso,
  HALF_SLOT_WIDTH,
  isPastReservation,
} from '@/lib/admin-calendar'
import type { Reservation, RestaurantTable } from '@/lib/reservation-types'

const CALENDAR_START_MINUTES = 10 * 60
const CALENDAR_END_MINUTES = 22 * 60 + 30
const TABLE_LABEL_WIDTH = 112

export function useDayCalendarView({
  reservations,
  tables,
  selectedDate,
  onConfirm,
}: {
  reservations: Reservation[]
  tables: RestaurantTable[]
  selectedDate: string
  onConfirm: (reservation: Reservation) => void | Promise<void>
}) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [nowMs, setNowMs] = useState<number | null>(null)
  const [isPendingExpanded, setIsPendingExpanded] = useState(false)
  const [assigningPendingId, setAssigningPendingId] = useState<string | null>(null)

  const todayStr = useMemo(() => {
    void selectedDate
    return getTodayIso()
  }, [selectedDate])
  const isPastDate = isPastReservation(selectedDate, todayStr)

  useEffect(() => {
    const updateTime = () => setNowMs(Date.now())
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const slots = useMemo(() => createHalfHourSlots(selectedDate), [selectedDate])
  const activeTables = useMemo(
    () => tables.filter((table) => table.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [tables],
  )
  const dayReservations = useMemo(
    () =>
      reservations
        .filter((reservation) => reservation.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, selectedDate],
  )
  const pendingUnassignedReservations = useMemo(
    () =>
      dayReservations.filter(
        (reservation) => reservation.status === 'pending' && !reservation.tableId,
      ),
    [dayReservations],
  )
  const visiblePendingReservations = useMemo(
    () =>
      isPendingExpanded
        ? pendingUnassignedReservations
        : pendingUnassignedReservations.slice(0, 3),
    [isPendingExpanded, pendingUnassignedReservations],
  )
  const assignedReservations = useMemo(
    () =>
      dayReservations.filter(
        (reservation) => reservation.tableId && reservation.status !== 'pending',
      ),
    [dayReservations],
  )
  const hiddenPendingCount = Math.max(
    0,
    pendingUnassignedReservations.length - visiblePendingReservations.length,
  )

  const handlePendingConfirm = useCallback(
    async (reservation: Reservation) => {
      if (assigningPendingId) return
      setAssigningPendingId(reservation.id)
      try {
        await onConfirm(reservation)
      } finally {
        setAssigningPendingId(null)
      }
    },
    [assigningPendingId, onConfirm],
  )

  const timelineMetrics = useMemo(
    () => buildTimelineMetrics(selectedDate, activeTables.length, slots),
    [activeTables.length, selectedDate, slots],
  )
  const currentTimeLeft = useMemo(
    () => getCurrentTimeLeft(selectedDate, nowMs),
    [nowMs, selectedDate],
  )

  return {
    selectedReservation,
    setSelectedReservation,
    isCalendarOpen,
    setIsCalendarOpen,
    isPastDate,
    slots,
    activeTables,
    assignedReservations,
    pendingUnassignedReservations,
    visiblePendingReservations,
    hiddenPendingCount,
    isPendingExpanded,
    setIsPendingExpanded,
    assigningPendingId,
    handlePendingConfirm,
    currentTimeLeft,
    ...timelineMetrics,
  }
}

function getCurrentTimeLeft(selectedDate: string, nowMs: number | null) {
  if (!nowMs) return null

  const now = new Date(nowMs)
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  if (selectedDate !== `${y}-${m}-${d}`) return null

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  if (currentMinutes < CALENDAR_START_MINUTES || currentMinutes > CALENDAR_END_MINUTES) {
    return null
  }

  const pixelsFromStart = (currentMinutes - CALENDAR_START_MINUTES) * (HALF_SLOT_WIDTH / 30)
  return TABLE_LABEL_WIDTH + pixelsFromStart
}
