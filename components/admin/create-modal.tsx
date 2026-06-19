import * as React from 'react'
import { useEffect, useState } from 'react'
import { CalendarDays, Check, Clock, Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import type { ActionResult, ReservationInput, RestaurantTable } from '@/lib/reservation-types'
import { TIME_SLOTS, OCCASIONS, formatDate, isPastTimeSlot, getAvailableTimeSlots } from '@/lib/restaurant'
import { cn, validateVNPhone } from '@/lib/utils'
import { AdminCustomerInfoFields } from '@/components/admin/admin-customer-info-fields'
import { AdminSchedulingFields } from '@/components/admin/admin-scheduling-fields'
import { TableSelectionGrid } from '@/components/admin/table-selection-grid'
import { CapacityWarningAlert } from '@/components/admin/capacity-warning-alert'
import { TimePickerDropdown } from '@/components/admin/time-picker-dropdown'

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReservationInput) => Promise<boolean>
  tables: RestaurantTable[]
  getAvailableTables: (
    date: string,
    time: string,
    partySize: number,
  ) => Promise<ActionResult<RestaurantTable[]>>
}

export function CreateModal({ isOpen, onClose, onSubmit, tables, getAvailableTables }: CreateModalProps) {
  const [cName, setCName] = useState('')
  const [cPhone, setCPhone] = useState('')

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

  const [cDate, setCDate] = useState('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [cTime, setCTime] = useState(TIME_SLOTS[7]) // default to 17:00
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

  // Form validations
  const isCPartyValid = Number(cPartySize) > 0 && Number(cPartySize) <= 24 && !isNaN(Number(cPartySize))
  const isCPhoneValid = cPhone.trim() === '' || validateVNPhone(cPhone)
  const hasSchedulingFields = Boolean(cDate && cTime && isCPartyValid)
  const partySize = Number(cPartySize) || 0
  const activeTables = tables.filter((table) => table.active)
  const availableTableIds = new Set(availableTables.map((table) => table.id))

  const mainTable = activeTables.find((t) => t.id === cTableId)
  const secondaryTables = activeTables.filter((t) => cSecondaryTableIds.includes(t.id))
  const groupedTables = activeTables.reduce<Record<string, RestaurantTable[]>>((acc, table) => {
    acc[table.floor] = [...(acc[table.floor] ?? []), table]
    return acc
  }, {})
  const totalCapacity =
    (mainTable?.capacity ?? 0) + secondaryTables.reduce((sum, table) => sum + table.capacity, 0)
  const isCapacityInsufficient = Boolean(cTableId && totalCapacity < partySize)
  const selectedTables = [mainTable, ...secondaryTables].filter(
    (table): table is RestaurantTable => Boolean(table),
  )
  const isCapacityExcessive = Boolean(
    cTableId &&
      selectedTables.length > 1 &&
      selectedTables.some((table) => totalCapacity - table.capacity >= partySize)
  )
  const hasUnresolvedCapacityWarning = Boolean(isCapacityInsufficient && !cIsManualArrangement)
  const showLargePartyTip = Boolean(
    cTableId && partySize > 4 && mainTable && mainTable.capacity < partySize && cSecondaryTableIds.length === 0,
  )

  const isCreateValid = Boolean(
    cName.trim() &&
    cPhone.trim() &&
    validateVNPhone(cPhone) &&
    cDate &&
    cTime &&
    isCPartyValid &&
    !hasUnresolvedCapacityWarning
  )

  useEffect(() => {
    if (cTime && isPastTimeSlot(cTime, cDate)) {
      setCTime('')
    }
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
      if (cSecondaryTableIds.length > 0) {
        setCSecondaryTableIds([])
      }
      if (cIsManualArrangement) {
        setCIsManualArrangement(false)
      }
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
      // Deselecting main table
      if (cSecondaryTableIds.length > 0) {
        setCTableId(cSecondaryTableIds[0])
        setCSecondaryTableIds(cSecondaryTableIds.slice(1))
      } else {
        setCTableId('')
      }
    } else if (isSecondary) {
      // Deselecting secondary table
      setCSecondaryTableIds((prev) => prev.filter((id) => id !== tableId))
    } else {
      // Selecting new table (always additive/multi-select)
      if (!cTableId) {
        setCTableId(tableId)
      } else {
        setCSecondaryTableIds((prev) => [...prev, tableId])
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isCreateValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const didCreate = await onSubmit({
        name: cName.trim(),
        phone: cPhone.trim(),
        date: cDate,
        time: cTime,
        partySize: Number(cPartySize),
        occasion: cOccasion === OCCASIONS[0] ? undefined : cOccasion,
        manualArrangement: cTableId ? cIsManualArrangement : false,
        tableId: cTableId || undefined,
        secondaryTableIds: cTableId ? cSecondaryTableIds : [],
        notes: cNotes.trim() || undefined,
      })

      if (!didCreate) return

      // Reset fields
      setCName('')
      setCPhone('')

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
    } finally {
      setIsSubmitting(false)
    }
  }

  const fittingTableCount = availableTables.filter((table) => table.capacity >= partySize).length
  const selectedTableSummary = selectedTables.map((table) => table.code).join(' + ')
  const bookingSummary = [
    cDate ? formatDate(cDate) : null,
    cTime || null,
    isCPartyValid ? `${partySize} khách` : null,
    selectedTableSummary || null,
  ].filter(Boolean).join(' · ')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[90dvh] w-full max-w-[720px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in scale-in duration-200">
        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary shrink-0" />
        
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </span>
            <h3 className="font-serif text-lg font-bold text-foreground">Tạo đặt bàn</h3>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={cn("no-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3", (isTimeOpen || isCalendarOpen) && "overflow-hidden")}>
          <AdminCustomerInfoFields
            name={cName}
            onNameChange={setCName}
            phone={cPhone}
            onPhoneChange={setCPhone}
            isPhoneValid={isCPhoneValid}
          />

          <AdminSchedulingFields
            date={cDate}
            onDateChange={setCDate}
            isCalendarOpen={isCalendarOpen}
            setIsCalendarOpen={setIsCalendarOpen}
            minDate={new Date()}
            time={cTime}
            onTimeChange={setCTime}
            isTimeOpen={isTimeOpen}
            setIsTimeOpen={setIsTimeOpen}
            availableTimeSlots={getAvailableTimeSlots(Number(cPartySize) || 1, cDate).filter(
              (t) => !isPastTimeSlot(t, cDate)
            )}
            partySize={cPartySize}
            onPartySizeChange={setCPartySize}
            occasion={cOccasion}
            onOccasionChange={setCOccasion}
          />

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/10 p-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cTableId" className="text-xs font-bold">Gán bàn ngay</Label>
                  {cTableId && (
                    <button
                      type="button"
                      onClick={() => handleTableToggle('')}
                      className="cursor-pointer text-[10px] font-semibold text-destructive hover:underline"
                    >
                      Bỏ chọn để tạo chờ duyệt
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-pretty text-muted-foreground">
                  Có thể để trống để tạo booking chờ duyệt, hoặc chọn bàn để xác nhận ngay.
                </p>
              </div>
              {isLoadingTables ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground shrink-0">
                  <Loader2 className="size-3 animate-spin" />
                  Đang kiểm tra
                </span>
              ) : null}
            </div>

            {hasSchedulingFields && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-card px-2.5 py-2 text-[11px] font-semibold text-muted-foreground">
                <span>{availableTables.length} bàn trống</span>
                <span className="text-border" aria-hidden="true">/</span>
                <span>Phù hợp: {fittingTableCount}</span>
                <span className="text-border" aria-hidden="true">/</span>
                <span>Cần {partySize} ghế</span>
              </div>
            )}

            {hasSchedulingFields && (
              <TableSelectionGrid
                groupedTables={groupedTables}
                availableTableIds={availableTableIds}
                cTableId={cTableId}
                cSecondaryTableIds={cSecondaryTableIds}
                isLoadingTables={isLoadingTables}
                onToggleTable={handleTableToggle}
                variant="chips"
              />
            )}

            {tableError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive">
                {tableError}
              </div>
            )}

            {!hasSchedulingFields && (
              <div className="rounded-lg border border-border/60 bg-background px-3 py-2 text-[11px] text-muted-foreground">
                Chọn ngày, giờ và số lượng khách để kiểm tra danh sách bàn trống.
              </div>
            )}

            {hasSchedulingFields && !isLoadingTables && availableTables.length === 0 && !tableError && (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                Khung giờ này hiện không còn bàn trống. Bạn vẫn có thể tạo booking pending nếu bỏ trống phần gán bàn.
              </div>
            )}

            {cTableId && !hasUnresolvedCapacityWarning && (
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700">
                <Check className="size-3.5" />
                Đủ chỗ cho {partySize} khách
              </div>
            )}

            {(isCapacityInsufficient || isCapacityExcessive || showLargePartyTip) && (
              <CapacityWarningAlert
                  cTableId={cTableId}
                  totalCapacity={totalCapacity}
                  partySize={partySize}
                  isCapacityInsufficient={isCapacityInsufficient}
                  isCapacityExcessive={isCapacityExcessive}
                  cIsManualArrangement={cIsManualArrangement}
                  setCIsManualArrangement={setCIsManualArrangement}
                  setCSecondaryTableIds={setCSecondaryTableIds}
                  showLargePartyTip={showLargePartyTip}
                />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="cNotes" className="text-[11px] font-bold">Ghi chú yêu cầu</Label>
            <textarea
              id="cNotes"
              name="notes"
              value={cNotes}
              onChange={(e) => setCNotes(e.target.value)}
              rows={2}
              placeholder="Yêu cầu đặc biệt nếu có…"
              className="resize-none rounded-lg border border-input bg-background/70 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2.5 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-h-4 truncate text-xs font-semibold text-muted-foreground">
              {bookingSummary || 'Điền thông tin để tạo đặt bàn'}
            </p>
            <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 rounded-lg text-xs">Hủy bỏ</Button>
            <Button type="submit" size="sm" disabled={!isCreateValid || isSubmitting} className="h-8 min-w-32 gap-1 rounded-lg text-xs">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Đang xử lý…
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Xác nhận
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
