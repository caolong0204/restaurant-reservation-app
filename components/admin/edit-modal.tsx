import * as React from 'react'
import { useState, useEffect } from 'react'
import { AlertTriangle, CalendarDays, Check, Edit3, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import { type Reservation } from '@/components/reservation-provider'
import type { ReservationInput, RestaurantTable } from '@/lib/reservation-types'
import { TIME_SLOTS, OCCASIONS, formatDate } from '@/lib/restaurant'
import { validateVNPhone, cn } from '@/lib/utils'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation | null
  onSubmit: (id: string, data: ReservationInput) => void
  onCancelBooking?: (id: string) => void
  tables: RestaurantTable[]
}

export function EditModal({ isOpen, onClose, reservation, onSubmit, onCancelBooking, tables }: EditModalProps) {
  const [eName, setEName] = useState('')
  const [ePhone, setEPhone] = useState('')

  const [eDate, setEDate] = useState('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [eTime, setETime] = useState('')
  const [ePartySize, setEPartySize] = useState('')
  const [eOccasion, setEOccasion] = useState('')
  const [eTableId, setETableId] = useState('')
  const [eSecondaryTableIds, setESecondaryTableIds] = useState<string[]>([])
  const [eIsManualArrangement, setEIsManualArrangement] = useState(false)
  const [eNotes, setENotes] = useState('')

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
  const totalCapacity = (mainTable?.capacity ?? 0) + secondaryTables.reduce((sum, t) => sum + t.capacity, 0)
  const partySize = Number(ePartySize) || 0

  const hasCapacityWarning = eTableId && totalCapacity < partySize
  const showLargePartyTip = eTableId && partySize > 4 && mainTable && mainTable.capacity < partySize && eSecondaryTableIds.length === 0
  const hasUnresolvedCapacityWarning = Boolean(hasCapacityWarning && !eIsManualArrangement)

  const toggleSecondaryTable = (tableId: string) => {
    setESecondaryTableIds((prev) => {
      const next = prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
      if (next.length > 0) {
        setEIsManualArrangement(false)
      }
      return next
    })
  }

  const handleMainTableChange = (val: string) => {
    setETableId(val)
    setEIsManualArrangement(false)
    if (!val) {
      setESecondaryTableIds([])
    } else {
      const newMainTable = tables.find((t) => t.id === val)
      if (newMainTable && newMainTable.capacity >= partySize) {
        setESecondaryTableIds([])
      } else {
        setESecondaryTableIds((prev) => prev.filter((id) => id !== val))
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEditValid || !reservation || hasUnresolvedCapacityWarning) return

    onSubmit(reservation.id, {
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
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl relative overflow-hidden animate-in scale-in duration-200 max-h-[95dvh] flex flex-col">
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

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="eName" className="text-xs font-semibold">Tên khách hàng</Label>
              <Input id="eName" value={eName} onChange={(e) => setEName(e.target.value)} required className="rounded-lg h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ePhone" className="text-xs font-semibold">Số điện thoại</Label>
              <Input id="ePhone" type="tel" value={ePhone} onChange={(e) => setEPhone(e.target.value)} required className="rounded-lg h-9 text-sm" aria-invalid={!isEPhoneValid || undefined} />
              {!isEPhoneValid && (
                <span className="text-[10px] text-destructive font-medium">SĐT không hợp lệ (VN format)</span>
              )}
            </div>
          </div>



          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="eDate" className="text-xs font-semibold">Ngày dùng bữa</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id="eDate"
                      variant="outline"
                      className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm font-normal justify-start pl-3 text-left shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  }
                >
                  <CalendarDays className="size-4 mr-2 text-muted-foreground shrink-0" />
                  <span className={eDate ? 'text-foreground' : 'text-muted-foreground/60'}>
                    {eDate ? formatDate(eDate) : 'Chọn ngày'}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none animate-in fade-in-50 slide-in-from-top-1 duration-150" align="start">
                  <RestaurantCalendar
                    selected={eDate ? new Date(`${eDate}T00:00:00`) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        setEDate(`${year}-${month}-${day}`)
                      } else {
                        setEDate('')
                      }
                      setIsCalendarOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="eTime" className="text-xs font-semibold">Giờ đón khách</Label>
              <select id="eTime" value={eTime} onChange={(e) => setETime(e.target.value)} required className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ePartySize" className="text-xs font-semibold">Số lượng khách</Label>
              <Input id="ePartySize" type="number" min="1" max="24" value={ePartySize} onChange={(e) => setEPartySize(e.target.value)} required className="rounded-lg h-9 text-sm" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="eOccasion" className="text-xs font-semibold">Dịp đặc biệt</Label>
              <select id="eOccasion" value={eOccasion} onChange={(e) => setEOccasion(e.target.value)} className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full">
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="eTableId" className="text-xs font-semibold">Bàn chỉ định</Label>
              <select id="eTableId" value={eTableId} onChange={(e) => handleMainTableChange(e.target.value)} className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full">
                <option value="">Chưa gán bàn</option>
                {tables.filter(t => t.active).map((t) => (
                  <option key={t.id} value={t.id}>{t.code} ({t.floor === 'Tầng 1' ? 'T1' : 'T2'}) - {t.capacity} ghế</option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Table Checklist */}
          {eTableId && (
            <div className="flex flex-col gap-3 border border-border bg-secondary/5 rounded-lg p-3">
              {hasCapacityWarning && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={eIsManualArrangement}
                    onChange={(e) => {
                      setEIsManualArrangement(e.target.checked)
                      if (e.target.checked) {
                        setESecondaryTableIds([])
                      }
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

              {!eIsManualArrangement && tables.filter(t => t.active && t.id !== eTableId).length > 0 && (
                <div className="border-t border-border/60 pt-2.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Ghép thêm bàn phụ (Không bắt buộc)
                  </span>
                  <div className="grid gap-1.5 grid-cols-2 max-h-[120px] overflow-y-auto pr-1">
                    {tables.filter(t => t.active && t.id !== eTableId).map((table) => {
                      const isChecked = eSecondaryTableIds.includes(table.id)
                      return (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => toggleSecondaryTable(table.id)}
                          className={cn(
                            'rounded-lg border p-2 text-left transition-all flex items-center justify-between text-xs',
                            isChecked
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-border bg-card hover:border-amber-500/40',
                          )}
                        >
                          <div className="truncate pr-1">
                            <span className="font-bold">{table.code}</span>
                            <span className="text-[10px] text-muted-foreground ml-1.5">({table.capacity} ghế)</span>
                          </div>
                          <div className={cn(
                            'size-3.5 rounded border flex items-center justify-center transition-all shrink-0 ml-1',
                            isChecked
                              ? 'border-amber-500 bg-amber-500 text-white'
                              : 'border-border bg-card',
                          )}>
                            {isChecked && <Check className="size-2.5" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning and Hint Notes */}
          {eTableId && hasCapacityWarning && (
            <div className="flex flex-col gap-1.5 text-xs bg-secondary/25 p-2.5 rounded-lg border border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold font-sans">Sức chứa tổng cộng:</span>
                <span className={cn('font-bold font-mono', hasCapacityWarning && !eIsManualArrangement ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400')}>
                  Đã chọn: {totalCapacity} ghế / {partySize} khách
                </span>
              </div>
              {hasCapacityWarning && !eIsManualArrangement && (
                <div className="text-[10.5px] text-destructive leading-tight flex items-start gap-1 font-medium mt-1">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>
                    <strong>Cảnh báo:</strong> Số lượng khách ({partySize}) nhiều hơn tổng số ghế ({totalCapacity}) của các bàn đã chọn. Vui lòng ghép thêm bàn phụ hoặc tích chọn tự sắp xếp thêm ghế/bàn ngoài.
                  </span>
                </div>
              )}
              {eIsManualArrangement && (
                <div className="text-[10.5px] text-emerald-700 dark:text-emerald-400 leading-tight flex items-start gap-1 font-medium mt-1">
                  <Check className="size-3.5 shrink-0" />
                  <span>
                    Admin xác nhận tự sắp xếp thêm ghế hoặc bàn phụ ngoài hệ thống.
                  </span>
                </div>
              )}
              {showLargePartyTip && !eIsManualArrangement && (
                <div className="text-[10.5px] text-blue-700 dark:text-blue-400 leading-tight flex items-start gap-1 font-medium mt-1">
                  <Info className="size-3.5 shrink-0" />
                  <span>
                    <strong>Gợi ý:</strong> Đặt bàn này dành cho nhóm đông ({partySize} người). Vui lòng ghép thêm bàn phụ để phục vụ tốt nhất.
                  </span>
                </div>
              )}
            </div>
          )}

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
              <Button type="submit" size="sm" disabled={!isEditValid || hasUnresolvedCapacityWarning} className="h-9 rounded-lg text-xs gap-1 shadow-xs">
                <Check className="size-3.5" />
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
