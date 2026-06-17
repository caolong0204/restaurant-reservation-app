import * as React from 'react'
import { useEffect, useState } from 'react'
import { AlertTriangle, CalendarDays, Check, Info, Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import type { ActionResult, ReservationInput, RestaurantTable } from '@/lib/reservation-types'
import { TIME_SLOTS, OCCASIONS, formatDate, isPastTimeSlot } from '@/lib/restaurant'
import { cn, validateVNPhone } from '@/lib/utils'

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

  const [cDate, setCDate] = useState('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [cTime, setCTime] = useState(TIME_SLOTS[7]) // default to 17:00
  const [cPartySize, setCPartySize] = useState('4')
  const [cOccasion, setCOccasion] = useState(OCCASIONS[0])
  const [cTableId, setCTableId] = useState('')
  const [cSecondaryTableIds, setCSecondaryTableIds] = useState<string[]>([])
  const [cIsManualArrangement, setCIsManualArrangement] = useState(false)
  const [cNotes, setCNotes] = useState('')
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)

  // Form validations
  const isCPartyValid = Number(cPartySize) > 0 && Number(cPartySize) <= 24 && !isNaN(Number(cPartySize))
  const isCPhoneValid = cPhone.trim() === '' || validateVNPhone(cPhone)
  const hasSchedulingFields = Boolean(cDate && cTime && isCPartyValid)
  const partySize = Number(cPartySize) || 0
  const activeTables = tables.filter((table) => table.active)
  const availableTableIds = new Set(availableTables.map((table) => table.id))

  const mainTable = activeTables.find((t) => t.id === cTableId)
  const secondaryTables = activeTables.filter((t) => cSecondaryTableIds.includes(t.id))
  const totalCapacity =
    (mainTable?.capacity ?? 0) + secondaryTables.reduce((sum, table) => sum + table.capacity, 0)
  const hasCapacityWarning = Boolean(cTableId && totalCapacity < partySize)
  const hasUnresolvedCapacityWarning = Boolean(hasCapacityWarning && !cIsManualArrangement)
  const showLargePartyTip =
    Boolean(cTableId && partySize > 4 && mainTable && mainTable.capacity < partySize && cSecondaryTableIds.length === 0)

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

  const handleMainTableChange = (value: string) => {
    setCTableId(value)
    setCIsManualArrangement(false)

    if (!value) {
      setCSecondaryTableIds([])
      return
    }

    const nextMainTable = activeTables.find((table) => table.id === value)
    if (nextMainTable && nextMainTable.capacity >= partySize) {
      setCSecondaryTableIds([])
      return
    }

    setCSecondaryTableIds((prev) => prev.filter((id) => id !== value))
  }

  const toggleSecondaryTable = (tableId: string) => {
    setCSecondaryTableIds((prev) => {
      const next = prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
      if (next.length > 0) setCIsManualArrangement(false)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isCreateValid) return

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
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl relative overflow-hidden animate-in scale-in duration-200">
        {/* Top brand line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Thêm Đặt Bàn Thủ Công</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
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
              <select id="cTime" value={cTime} onChange={(e) => setCTime(e.target.value)} required className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="" disabled>
                  Chọn giờ
                </option>
                {TIME_SLOTS.map((t) => {
                  const isPast = isPastTimeSlot(t, cDate)
                  return (
                    <option key={t} value={t} disabled={isPast}>
                      {isPast ? `${t} · Qua giờ` : t}
                    </option>
                  )
                })}
              </select>
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
              <div>
                <Label htmlFor="cTableId" className="text-xs font-semibold">Gán bàn ngay</Label>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Có thể để trống để tạo booking chờ duyệt, hoặc chọn bàn để xác nhận ngay.
                </p>
              </div>
              {isLoadingTables ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Đang kiểm tra
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <select
                id="cTableId"
                value={cTableId}
                onChange={(e) => handleMainTableChange(e.target.value)}
                disabled={!hasSchedulingFields || isLoadingTables}
                className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Chưa gán bàn (tạo pending)</option>
                {activeTables.map((table) => (
                  <option key={table.id} value={table.id} disabled={!availableTableIds.has(table.id)}>
                    {table.code} ({table.floor === 'Tầng 1' ? 'T1' : 'T2'}) - {table.capacity} ghế
                  </option>
                ))}
              </select>
            </div>

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

            {cTableId && (
              <div className="flex flex-col gap-3 border-t border-border/60 pt-3">
                {hasCapacityWarning && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cIsManualArrangement}
                      onChange={(e) => {
                        setCIsManualArrangement(e.target.checked)
                        if (e.target.checked) setCSecondaryTableIds([])
                      }}
                      className="rounded border-input text-primary focus:ring-primary size-3.5"
                    />
                    <div className="leading-tight">
                      <span className="text-xs font-bold text-foreground block">
                        Tự sắp xếp thêm ghế / bàn phụ ngoài hệ thống
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Không cần ghép bàn trên ứng dụng.
                      </span>
                    </div>
                  </label>
                )}

                {!cIsManualArrangement && activeTables.filter((table) => table.id !== cTableId).length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Ghép thêm bàn phụ (Không bắt buộc)
                    </span>
                    <div className="grid gap-1.5 grid-cols-2 max-h-[120px] overflow-y-auto pr-1">
                      {activeTables.filter((table) => table.id !== cTableId).map((table) => {
                        const isChecked = cSecondaryTableIds.includes(table.id)
                        const isAvailable = availableTableIds.has(table.id)
                        return (
                          <button
                            key={table.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => toggleSecondaryTable(table.id)}
                            className={cn(
                              'rounded-lg border p-2 text-left transition-all flex items-center justify-between text-xs disabled:cursor-not-allowed disabled:opacity-45',
                              isChecked
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-border bg-card hover:border-amber-500/40',
                              !isAvailable && 'hover:border-border bg-muted/30',
                            )}
                          >
                            <div className="truncate pr-1">
                              <span className="font-bold">{table.code}</span>
                              <span className="text-[10px] text-muted-foreground ml-1.5">
                                ({table.capacity} ghế{!isAvailable ? ' · bận' : ''})
                              </span>
                            </div>
                            <div
                              className={cn(
                                'size-3.5 rounded border flex items-center justify-center transition-all shrink-0 ml-1',
                                isChecked
                                  ? 'border-amber-500 bg-amber-500 text-white'
                                  : 'border-border bg-card',
                              )}
                            >
                              {isChecked && <Check className="size-2.5" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {hasCapacityWarning && (
                  <div className="flex flex-col gap-1.5 text-xs bg-secondary/25 p-2.5 rounded-lg border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-semibold">Sức chứa tổng cộng:</span>
                      <span className={cn('font-bold font-mono', hasCapacityWarning && !cIsManualArrangement ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400')}>
                        Đã chọn: {totalCapacity} ghế / {partySize} khách
                      </span>
                    </div>
                    {hasCapacityWarning && !cIsManualArrangement && (
                      <div className="text-[10.5px] text-destructive leading-tight flex items-start gap-1 font-medium mt-1">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>
                          <strong>Cảnh báo:</strong> Số lượng khách ({partySize}) nhiều hơn tổng số ghế ({totalCapacity}) của các bàn đã chọn. Vui lòng ghép thêm bàn phụ hoặc tích chọn tự sắp xếp thêm ghế/bàn ngoài.
                        </span>
                      </div>
                    )}
                    {cIsManualArrangement && (
                      <div className="text-[10.5px] text-emerald-700 dark:text-emerald-400 leading-tight flex items-start gap-1 font-medium mt-1">
                        <Check className="size-3.5 shrink-0" />
                        <span>
                          Admin xác nhận tự sắp xếp thêm ghế hoặc bàn phụ ngoài hệ thống.
                        </span>
                      </div>
                    )}
                    {showLargePartyTip && !cIsManualArrangement && (
                      <div className="text-[10.5px] text-blue-700 dark:text-blue-400 leading-tight flex items-start gap-1 font-medium mt-1">
                        <Info className="size-3.5 shrink-0" />
                        <span>
                          <strong>Gợi ý:</strong> Đặt bàn này dành cho nhóm đông ({partySize} người). Vui lòng ghép thêm bàn phụ để phục vụ tốt nhất.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="cNotes" className="text-xs font-semibold">Ghi chú yêu cầu</Label>
            <textarea id="cNotes" value={cNotes} onChange={(e) => setCNotes(e.target.value)} rows={2} placeholder="Yêu cầu đặc biệt nếu có..." className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/50" />
          </div>



          <div className="flex justify-end gap-2 border-t border-border pt-3 mt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 rounded-lg text-xs">Hủy bỏ</Button>
            <Button type="submit" size="sm" disabled={!isCreateValid} className="h-9 rounded-lg text-xs gap-1">
              <Check className="size-3.5" />
              Xác nhận đặt bàn
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
