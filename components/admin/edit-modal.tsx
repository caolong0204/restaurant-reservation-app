import * as React from 'react'
import { useState, useEffect } from 'react'
import { CalendarDays, Check, Clock, Edit3, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import { type Reservation } from '@/components/reservation-provider'
import type { ReservationInput, RestaurantTable } from '@/lib/reservation-types'
import { TIME_SLOTS, OCCASIONS, formatDate, getAvailableTimeSlots, isPastTimeSlot } from '@/lib/restaurant'
import { cn, validateVNPhone } from '@/lib/utils'
import { AdminCustomerInfoFields } from '@/components/admin/admin-customer-info-fields'
import { AdminSchedulingFields } from '@/components/admin/admin-scheduling-fields'
import { TableSelectionGrid } from '@/components/admin/table-selection-grid'
import { CapacityWarningAlert } from '@/components/admin/capacity-warning-alert'
import { TimePickerDropdown } from '@/components/admin/time-picker-dropdown'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation | null
  onSubmit: (id: string, data: ReservationInput) => Promise<void> | void
  onCancelBooking?: (id: string) => void
  tables: RestaurantTable[]
}

export function EditModal({ isOpen, onClose, reservation, onSubmit, onCancelBooking, tables }: EditModalProps) {
  const [eName, setEName] = useState('')
  const [ePhone, setEPhone] = useState('')

  // Prevent background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      const activeModals = document.querySelectorAll('.fixed.inset-0')
      if (activeModals.length <= 1) {
        document.body.style.overflow = ''
      }
    }
    return () => {
      const activeModals = document.querySelectorAll('.fixed.inset-0')
      if (activeModals.length <= 1) {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  const [eDate, setEDate] = useState('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [eTime, setETime] = useState('')
  const [isTimeOpen, setIsTimeOpen] = useState(false)
  const [ePartySize, setEPartySize] = useState('')
  const [eOccasion, setEOccasion] = useState('')
  const [eTableId, setETableId] = useState('')
  const [eSecondaryTableIds, setESecondaryTableIds] = useState<string[]>([])
  const [eIsManualArrangement, setEIsManualArrangement] = useState(false)
  const [eNotes, setENotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const isOriginalDateTime = reservation && eTime === reservation.time && eDate === reservation.date;
    if (eTime && isPastTimeSlot(eTime, eDate) && !isOriginalDateTime) {
      setETime('')
    }
  }, [eDate, eTime, reservation])


  useEffect(() => {
    if (reservation) {
      setEName(reservation.name)
      setEPhone(reservation.phone)

      setEDate(reservation.date)
      setETime(reservation.time)
      setEPartySize(String(reservation.partySize))
      setEOccasion(reservation.occasion || OCCASIONS[0])
      setETableId(reservation.tableId || '')
      
      const secIds = reservation.secondaryTableIds || []
      setESecondaryTableIds(secIds)
      
      const mainTab = tables.find(t => t.id === reservation.tableId)
      const isCapacityShort = mainTab && mainTab.capacity < reservation.partySize
      setEIsManualArrangement(Boolean(reservation.manualArrangement ?? (isCapacityShort && secIds.length === 0)))
      
      setENotes(reservation.notes || '')
    }
  }, [reservation, tables])

  // Manual arrangement is only an explicit override when selected tables are short on capacity.
  useEffect(() => {
    if (eTableId) {
      const mainTab = tables.find(t => t.id === eTableId)
      if (mainTab) {
        const secondaryTables = tables.filter((t) => eSecondaryTableIds.includes(t.id))
        const selectedCapacity =
          mainTab.capacity + secondaryTables.reduce((sum, table) => sum + table.capacity, 0)

        if (selectedCapacity >= Number(ePartySize)) setEIsManualArrangement(false)
      }
    }
  }, [eTableId, ePartySize, tables, eSecondaryTableIds])

  if (!isOpen || !reservation) return null

  // Form validations
  const isEPartyValid = Number(ePartySize) > 0 && Number(ePartySize) <= 24 && !isNaN(Number(ePartySize))
  const isEPhoneValid = ePhone.trim() === '' || validateVNPhone(ePhone)

  const isEditValid = Boolean(
    eName.trim() &&
    ePhone.trim() &&
    validateVNPhone(ePhone) &&
    eDate &&
    eTime &&
    isEPartyValid
  )

  const mainTable = tables.find((t) => t.id === eTableId)
  const secondaryTables = tables.filter((t) => eSecondaryTableIds.includes(t.id))
  const activeTables = tables.filter((t) => t.active)
  const availableTableIds = new Set(activeTables.map(t => t.id)) // All active tables are selectable in edit mode
  const groupedTables = activeTables.reduce<Record<string, RestaurantTable[]>>((acc, table) => {
    acc[table.floor] = [...(acc[table.floor] ?? []), table]
    return acc
  }, {})
  const totalCapacity = (mainTable?.capacity ?? 0) + secondaryTables.reduce((sum, t) => sum + t.capacity, 0)
  const partySize = Number(ePartySize) || 0

  const isCapacityInsufficient = Boolean(eTableId && totalCapacity < partySize)
  const selectedTables = [mainTable, ...secondaryTables].filter(
    (table): table is RestaurantTable => Boolean(table),
  )
  const isCapacityExcessive = Boolean(
    eTableId &&
      selectedTables.length > 1 &&
      selectedTables.some((table) => totalCapacity - table.capacity >= partySize)
  )
  const hasUnresolvedCapacityWarning = Boolean(isCapacityInsufficient && !eIsManualArrangement)
  const showLargePartyTip = Boolean(
    eTableId && partySize > 4 && mainTable && mainTable.capacity < partySize && eSecondaryTableIds.length === 0,
  )

  const handleTableToggle = (tableId: string) => {
    setEIsManualArrangement(false)

    if (!tableId) {
      setETableId('')
      setESecondaryTableIds([])
      return
    }

    const isMain = eTableId === tableId
    const isSecondary = eSecondaryTableIds.includes(tableId)

    if (isMain) {
      // Deselecting main table
      if (eSecondaryTableIds.length > 0) {
        setETableId(eSecondaryTableIds[0])
        setESecondaryTableIds(eSecondaryTableIds.slice(1))
      } else {
        setETableId('')
      }
    } else if (isSecondary) {
      // Deselecting secondary table
      setESecondaryTableIds((prev) => prev.filter((id) => id !== tableId))
    } else {
      // Selecting new table (always additive/multi-select)
      if (!eTableId) {
        setETableId(tableId)
      } else {
        setESecondaryTableIds((prev) => [...prev, tableId])
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEditValid || !reservation || hasUnresolvedCapacityWarning) return

    setIsSubmitting(true)
    try {
      await onSubmit(reservation.id, {
        name: eName.trim(),
        phone: ePhone.trim(),
        date: eDate,
        time: eTime,
        partySize: Number(ePartySize),
        occasion: eOccasion === OCCASIONS[0] ? undefined : eOccasion,
        notes: eNotes.trim() || undefined,
        manualArrangement: eIsManualArrangement,
        tableId: eTableId,
        secondaryTableIds: eSecondaryTableIds,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl relative overflow-hidden animate-in scale-in duration-200 max-h-[95dvh] flex flex-col">
        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-[1px]">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
        {/* Top brand line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary shrink-0" />

        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Edit3 className="size-4 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Sửa Thông Tin Đặt Bàn</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={cn("mt-4 flex flex-col gap-4 flex-1 pr-1 no-scrollbar", (isTimeOpen || isCalendarOpen) ? "overflow-hidden" : "overflow-y-auto")}>
          <AdminCustomerInfoFields
            name={eName}
            onNameChange={setEName}
            phone={ePhone}
            onPhoneChange={setEPhone}
            isPhoneValid={isEPhoneValid}
          />



          <AdminSchedulingFields
            date={eDate}
            onDateChange={setEDate}
            isCalendarOpen={isCalendarOpen}
            setIsCalendarOpen={setIsCalendarOpen}
            time={eTime}
            onTimeChange={setETime}
            isTimeOpen={isTimeOpen}
            setIsTimeOpen={setIsTimeOpen}
            availableTimeSlots={(() => {
              const slots = getAvailableTimeSlots(Number(ePartySize) || 1, eDate).filter(
                (t) => {
                  const isOriginalDateTime = reservation && t === reservation.time && eDate === reservation.date;
                  return !isPastTimeSlot(t, eDate) || isOriginalDateTime;
                }
              )
              // Always include reservation.time if pre-selected to avoid state loss
              if (reservation && eDate === reservation.date && !slots.includes(reservation.time)) {
                slots.push(reservation.time)
                slots.sort()
              }
              return slots
            })()}
            partySize={ePartySize}
            onPartySizeChange={setEPartySize}
            occasion={eOccasion}
            onOccasionChange={setEOccasion}
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="eTableId" className="text-xs font-semibold">Bàn chỉ định</Label>
              {eTableId && (
                <button
                  type="button"
                  onClick={() => handleTableToggle('')}
                  className="text-[10px] text-destructive hover:underline font-semibold cursor-pointer"
                >
                  Bỏ chọn bàn (tạo pending)
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/5 p-3">
              <TableSelectionGrid
                groupedTables={groupedTables}
                availableTableIds={availableTableIds}
                cTableId={eTableId}
                cSecondaryTableIds={eSecondaryTableIds}
                isLoadingTables={false}
                onToggleTable={handleTableToggle}
              />

              <CapacityWarningAlert
                cTableId={eTableId}
                totalCapacity={totalCapacity}
                partySize={partySize}
                isCapacityInsufficient={isCapacityInsufficient}
                isCapacityExcessive={isCapacityExcessive}
                cIsManualArrangement={eIsManualArrangement}
                setCIsManualArrangement={setEIsManualArrangement}
                setCSecondaryTableIds={setESecondaryTableIds}
                showLargePartyTip={showLargePartyTip}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="eNotes" className="text-xs font-semibold">Ghi chú yêu cầu</Label>
            <textarea id="eNotes" value={eNotes} onChange={(e) => setENotes(e.target.value)} rows={2} className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/50" />
          </div>



          <div className="flex flex-col gap-2 border-t border-border pt-3 mt-1 shrink-0 bg-card sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              {hasUnresolvedCapacityWarning ? (
                <p className="text-xs font-medium text-destructive max-w-[200px] leading-tight">
                  Chưa thể lưu: cần ghép thêm bàn.
                </p>
              ) : reservation && reservation.status !== 'cancelled' && onCancelBooking ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onCancelBooking(reservation.id)} 
                  className="h-9 rounded-lg text-xs border-rose-200 text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 dark:border-rose-900/30 dark:hover:bg-rose-950/20 gap-1"
                >
                  <X className="size-3.5" />
                  Hủy đặt bàn
                </Button>
              ) : (
                <span />
              )}
            </div>
            <div className="flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 rounded-lg text-xs">Đóng</Button>
              <Button type="submit" size="sm" disabled={!isEditValid || hasUnresolvedCapacityWarning || isSubmitting} className="h-9 rounded-lg text-xs gap-1 shadow-xs min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
