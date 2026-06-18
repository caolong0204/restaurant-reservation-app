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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl relative overflow-hidden animate-in scale-in duration-200 max-h-[95dvh] flex flex-col">
        {/* Top brand line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary shrink-0" />
        
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Thêm Đặt Bàn Thủ Công</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={cn("mt-4 flex flex-col gap-4 flex-1 pr-1 no-scrollbar", (isTimeOpen || isCalendarOpen) ? "overflow-hidden" : "overflow-y-auto")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="cName" className="text-xs font-semibold">Tên khách hàng</Label>
              <Input id="cName" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Tên khách" required className="rounded-lg h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cPhone" className="text-xs font-semibold">Số điện thoại</Label>
              <Input id="cPhone" type="tel" value={cPhone} onChange={(e) => setCPhone(e.target.value)} placeholder="ví dụ: 090 123 4567" required className="rounded-lg h-9 text-sm" aria-invalid={!isCPhoneValid || undefined} />
              {!isCPhoneValid && (
                <span className="text-[10px] text-destructive font-medium">SĐT không hợp lệ (VN format)</span>
              )}
            </div>
          </div>



          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="cDate" className="text-xs font-semibold">Ngày dùng bữa</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id="cDate"
                      variant="outline"
                      className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm font-normal justify-start pl-3 text-left shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  }
                >
                  <CalendarDays className="size-4 mr-2 text-muted-foreground shrink-0" />
                  <span className={cDate ? 'text-foreground' : 'text-muted-foreground/60'}>
                    {cDate ? formatDate(cDate) : 'Chọn ngày'}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none animate-in fade-in-50 slide-in-from-top-1 duration-150" align="start">
                  <RestaurantCalendar
                    selected={cDate ? new Date(`${cDate}T00:00:00`) : undefined}
                    minDate={new Date()} // Prevent booking past dates
                    onSelect={(date) => {
                      if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        setCDate(`${year}-${month}-${day}`)
                      } else {
                        setCDate('')
                      }
                      setIsCalendarOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cTime" className="text-xs font-semibold">Giờ đón khách</Label>
              <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id="cTime"
                      variant="outline"
                      className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm font-normal justify-start pl-3 text-left shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  }
                >
                  <Clock className="size-4 mr-2 text-muted-foreground shrink-0" />
                  <span className={cTime ? 'text-foreground' : 'text-muted-foreground/60'}>
                    {cTime || 'Chọn giờ'}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3 max-h-[350px] overflow-y-auto" align="start">
                    {(() => {
                      const slots = getAvailableTimeSlots(partySize, cDate).filter(
                        (t) => !isPastTimeSlot(t, cDate)
                      )

                      return (
                        <TimePickerDropdown
                          slots={slots}
                          selectedTime={cTime}
                          onTimeSelect={setCTime}
                          onClose={() => setIsTimeOpen(false)}
                        />
                      )
                    })()}
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cPartySize" className="text-xs font-semibold">Số lượng khách</Label>
              <Input id="cPartySize" type="number" min="1" max="24" value={cPartySize} onChange={(e) => setCPartySize(e.target.value)} required className="rounded-lg h-9 text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="cOccasion" className="text-xs font-semibold">Dịp đặc biệt</Label>
            <select id="cOccasion" value={cOccasion} onChange={(e) => setCOccasion(e.target.value)} className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full">
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cTableId" className="text-xs font-semibold">Gán bàn ngay</Label>
                  {cTableId && (
                    <button
                      type="button"
                      onClick={() => handleTableToggle('')}
                      className="text-[10px] text-destructive hover:underline font-semibold cursor-pointer"
                    >
                      Bỏ chọn bàn (tạo pending)
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
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
              <TableSelectionGrid
                groupedTables={groupedTables}
                availableTableIds={availableTableIds}
                cTableId={cTableId}
                cSecondaryTableIds={cSecondaryTableIds}
                isLoadingTables={isLoadingTables}
                onToggleTable={handleTableToggle}
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
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="cNotes" className="text-xs font-semibold">Ghi chú yêu cầu</Label>
            <textarea id="cNotes" value={cNotes} onChange={(e) => setCNotes(e.target.value)} rows={2} placeholder="Yêu cầu đặc biệt nếu có..." className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/50" />
          </div>



          <div className="flex justify-end gap-2 border-t border-border pt-3 mt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 rounded-lg text-xs">Hủy bỏ</Button>
            <Button type="submit" size="sm" disabled={!isCreateValid || isSubmitting} className="h-9 rounded-lg text-xs gap-1 w-36">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Xác nhận đặt bàn
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
