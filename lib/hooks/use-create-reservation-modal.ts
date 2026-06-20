'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'

import type { ActionResult, ReservationInput, RestaurantTable, RestaurantWeeklyHour } from '@/lib/reservation-types'
import {
  getAvailableTimeSlots,
  isPastTimeSlot,
  OCCASIONS,
  formatDate,
} from '@/lib/restaurant'
import { validateVNPhone } from '@/lib/utils'

type GetAvailableTablesFn = (
  date: string,
  time: string,
  partySize: number,
) => Promise<ActionResult<RestaurantTable[]>>

export function useCreateReservationModal({
  isOpen,
  onSubmit,
  tables,
  weeklyHours,
  getAvailableTables,
}: {
  isOpen: boolean
  onSubmit: (data: ReservationInput) => Promise<boolean>
  tables: RestaurantTable[]
  weeklyHours: RestaurantWeeklyHour[]
  getAvailableTables: GetAvailableTablesFn
}) {
  const [cName, setCName] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cDate, setCDate] = useState('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [cTime, setCTime] = useState('17:00')
  const [isTimeOpen, setIsTimeOpen] = useState(false)
  const [cPartySize, setCPartySize] = useState('4')
  const [cOccasion, setCOccasion] = useState(OCCASIONS[0])
  const [cTableId, setCTableId] = useState('')
  const [cSecondaryTableIds, setCSecondaryTableIds] = useState<string[]>([])
  const [cIsManualArrangement, setCIsManualArrangement] = useState(false)
  const [cNotes, setCNotes] = useState('')
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else if (document.querySelectorAll('.fixed.inset-0').length <= 1) {
      document.body.style.overflow = ''
    }

    return () => {
      if (document.querySelectorAll('.fixed.inset-0').length <= 1) {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  const isCPartyValid = Number(cPartySize) > 0 && Number(cPartySize) <= 24 && !isNaN(Number(cPartySize))
  const isCPhoneValid = cPhone.trim() === '' || validateVNPhone(cPhone)
  const isCEmailValid = cEmail.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail)
  const hasSchedulingFields = Boolean(cDate && cTime && isCPartyValid)
  const partySize = Number(cPartySize) || 0

  const activeTables = useMemo(() => tables.filter((table) => table.active), [tables])
  const availableTableIds = useMemo(
    () => new Set(availableTables.map((table) => table.id)),
    [availableTables],
  )
  const mainTable = activeTables.find((table) => table.id === cTableId)
  const secondaryTables = activeTables.filter((table) => cSecondaryTableIds.includes(table.id))
  const groupedTables = useMemo(
    () =>
      activeTables.reduce<Record<string, RestaurantTable[]>>((acc, table) => {
        acc[table.floor] = [...(acc[table.floor] ?? []), table]
        return acc
      }, {}),
    [activeTables],
  )
  const totalCapacity =
    (mainTable?.capacity ?? 0) + secondaryTables.reduce((sum, table) => sum + table.capacity, 0)
  const isCapacityInsufficient = Boolean(cTableId && totalCapacity < partySize)
  const selectedTables = [mainTable, ...secondaryTables].filter(
    (table): table is RestaurantTable => Boolean(table),
  )
  const isCapacityExcessive = Boolean(
    cTableId &&
      selectedTables.length > 1 &&
      selectedTables.some((table) => totalCapacity - table.capacity >= partySize),
  )
  const hasUnresolvedCapacityWarning = Boolean(isCapacityInsufficient && !cIsManualArrangement)
  const showLargePartyTip = Boolean(
    cTableId &&
      partySize > 4 &&
      mainTable &&
      mainTable.capacity < partySize &&
      cSecondaryTableIds.length === 0,
  )
  const isCreateValid = Boolean(
    cName.trim() &&
      cPhone.trim() &&
      validateVNPhone(cPhone) &&
      isCEmailValid &&
      cDate &&
      cTime &&
      isCPartyValid &&
      !hasUnresolvedCapacityWarning,
  )

  useEffect(() => {
    if (cTime && isPastTimeSlot(cTime, cDate)) setCTime('')
  }, [cDate, cTime])

  useEffect(() => {
    if (!isOpen || !hasSchedulingFields) {
      setAvailableTables([])
      setIsLoadingTables(false)
      setTableError(null)
      setCTableId('')
      setCSecondaryTableIds([])
      setCIsManualArrangement(false)
      return
    }

    let isActive = true
    setIsLoadingTables(true)
    setTableError(null)

    getAvailableTables(cDate, cTime, Number(cPartySize))
      .then((result) => {
        if (!isActive) return
        if (result.ok) {
          setAvailableTables(result.data)
          setCTableId((prev) => (prev && result.data.some((table) => table.id === prev) ? prev : ''))
          setCSecondaryTableIds((prev) => prev.filter((id) => result.data.some((table) => table.id === id)))
          return
        }

        setAvailableTables([])
        setCTableId('')
        setCSecondaryTableIds([])
        setTableError(result.error)
      })
      .catch(() => {
        if (!isActive) return
        setAvailableTables([])
        setCTableId('')
        setCSecondaryTableIds([])
        setTableError('Không tải được danh sách bàn trống cho khung giờ này.')
      })
      .finally(() => {
        if (isActive) setIsLoadingTables(false)
      })

    return () => {
      isActive = false
    }
  }, [cDate, cPartySize, cTime, getAvailableTables, hasSchedulingFields, isOpen])

  useEffect(() => {
    if (!cTableId) {
      if (cSecondaryTableIds.length > 0) setCSecondaryTableIds([])
      if (cIsManualArrangement) setCIsManualArrangement(false)
      return
    }

    const currentMainTable = activeTables.find((table) => table.id === cTableId)
    if (!currentMainTable) return

    const selectedCapacity =
      currentMainTable.capacity +
      activeTables
        .filter((table) => cSecondaryTableIds.includes(table.id))
        .reduce((sum, table) => sum + table.capacity, 0)

    if (selectedCapacity >= partySize && cIsManualArrangement) {
      setCIsManualArrangement(false)
    }
  }, [activeTables, cIsManualArrangement, cSecondaryTableIds, cTableId, partySize])

  const handleTableToggle = (tableId: string) => {
    setCIsManualArrangement(false)
    if (!tableId) {
      setCTableId('')
      setCSecondaryTableIds([])
      return
    }

    const isMain = cTableId === tableId
    const isSecondary = cSecondaryTableIds.includes(tableId)
    if (isMain) {
      if (cSecondaryTableIds.length > 0) {
        setCTableId(cSecondaryTableIds[0])
        setCSecondaryTableIds(cSecondaryTableIds.slice(1))
      } else {
        setCTableId('')
      }
    } else if (isSecondary) {
      setCSecondaryTableIds((prev) => prev.filter((id) => id !== tableId))
    } else if (!cTableId) {
      setCTableId(tableId)
    } else {
      setCSecondaryTableIds((prev) => [...prev, tableId])
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isCreateValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const didCreate = await onSubmit({
        name: cName.trim(),
        phone: cPhone.trim(),
        email: cEmail.trim() || undefined,
        date: cDate,
        time: cTime,
        partySize: Number(cPartySize),
        occasion: cOccasion === OCCASIONS[0] ? undefined : cOccasion,
        manualArrangement: cTableId ? cIsManualArrangement : false,
        tableId: cTableId || undefined,
        secondaryTableIds: cTableId ? cSecondaryTableIds : [],
        notes: cNotes.trim() || undefined,
      })

      if (didCreate) resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setCName('')
    setCPhone('')
    setCEmail('')
    setCDate('')
    setCTime('')
    setCPartySize('4')
    setCOccasion(OCCASIONS[0])
    setCTableId('')
    setCSecondaryTableIds([])
    setCIsManualArrangement(false)
    setCNotes('')
    setAvailableTables([])
    setTableError(null)
  }

  const fittingTableCount = availableTables.filter((table) => table.capacity >= partySize).length
  const selectedTableSummary = selectedTables.map((table) => table.code).join(' + ')
  const bookingSummary = [
    cDate ? formatDate(cDate) : null,
    cTime || null,
    isCPartyValid ? `${partySize} khách` : null,
    selectedTableSummary || null,
  ]
    .filter(Boolean)
    .join(' · ')

  return {
    cName,
    setCName,
    cPhone,
    setCPhone,
    cEmail,
    setCEmail,
    cDate,
    setCDate,
    isCalendarOpen,
    setIsCalendarOpen,
    cTime,
    setCTime,
    isTimeOpen,
    setIsTimeOpen,
    cPartySize,
    setCPartySize,
    cOccasion,
    setCOccasion,
    cTableId,
    cSecondaryTableIds,
    cIsManualArrangement,
    setCIsManualArrangement,
    cNotes,
    setCNotes,
    availableTables,
    isLoadingTables,
    tableError,
    isSubmitting,
    isCPartyValid,
    isCPhoneValid,
    isCEmailValid,
    hasSchedulingFields,
    partySize,
    availableTableIds,
    groupedTables,
    totalCapacity,
    isCapacityInsufficient,
    isCapacityExcessive,
    hasUnresolvedCapacityWarning,
    showLargePartyTip,
    isCreateValid,
    fittingTableCount,
    bookingSummary,
    handleTableToggle,
    handleSubmit,
    setCSecondaryTableIds,
    availableTimeSlots: getAvailableTimeSlots(Number(cPartySize) || 1, cDate, weeklyHours).filter(
      (time) => !isPastTimeSlot(time, cDate),
    ),
  }
}
