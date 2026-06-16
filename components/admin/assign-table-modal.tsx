'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Armchair, Check, Info, Loader2, Users, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Reservation, RestaurantTable } from '@/lib/reservation-types'
import { formatDate, formatTime } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

interface AssignTableModalProps {
  isOpen: boolean
  reservation: Reservation | null
  availableTables: RestaurantTable[]
  isLoading: boolean
  onClose: () => void
  onConfirm: (tableId: string, secondaryTableIds: string[]) => void
}

export function AssignTableModal({
  isOpen,
  reservation,
  availableTables,
  isLoading,
  onClose,
  onConfirm,
}: AssignTableModalProps) {
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([])
  const [isManualArrangement, setIsManualArrangement] = useState(false)

  const bestFitTable = useMemo(() => {
    if (reservation && reservation.partySize <= 4) {
      return availableTables.find((t) => t.capacity >= reservation.partySize) || availableTables[0]
    }
    return availableTables[0]
  }, [availableTables, reservation])

  useEffect(() => {
    setSelectedTableIds(bestFitTable ? [bestFitTable.id] : [])
    setIsManualArrangement(false)
  }, [bestFitTable])

  if (!isOpen || !reservation) return null

  // Group tables by floor for the main table selector
  const groupedTables = availableTables.reduce<Record<string, RestaurantTable[]>>((acc, table) => {
    acc[table.floor] = [...(acc[table.floor] ?? []), table]
    return acc
  }, {})

  const selectedTableId = selectedTableIds[0] ?? ''
  const selectedSecondaryIds = selectedTableIds.slice(1)

  const mainTable = availableTables.find((t) => t.id === selectedTableId)
  const secondaryTables = availableTables.filter((t) => selectedSecondaryIds.includes(t.id))
  const totalCapacity = (mainTable?.capacity ?? 0) + secondaryTables.reduce((sum, t) => sum + t.capacity, 0)
  const partySize = reservation.partySize

  const hasCapacityWarning = selectedTableId && totalCapacity < partySize
  const showLargePartyTip = selectedTableId && partySize > 4 && selectedSecondaryIds.length === 0

  const toggleTableSelect = (tableId: string) => {
    setSelectedTableIds((prev) => {
      const isSelected = prev.includes(tableId)
      let next: string[]
      if (isSelected) {
        next = prev.filter((id) => id !== tableId)
      } else {
        next = [...prev, tableId]
      }
      
      if (next.length > 1) {
        setIsManualArrangement(false)
      }
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative max-h-[92dvh] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in scale-in duration-200 flex flex-col">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Armchair className="size-4 text-primary" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Gán bàn xác nhận
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {reservation.name} · {formatDate(reservation.date)} · {formatTime(reservation.time)} · {reservation.partySize} khách
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 flex-1 min-h-0">
          {isLoading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm font-medium">Đang kiểm tra bàn trống...</p>
            </div>
          ) : availableTables.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-secondary/25 text-center">
              <Armchair className="size-8 text-muted-foreground" />
              <div>
                <p className="font-serif text-base font-bold text-foreground">
                  Không còn bàn phù hợp
                </p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Khung giờ này không có bàn đủ sức chứa sau khi tính cửa sổ phục vụ.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Table Selector Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Chọn bàn (Có thể chọn nhiều bàn để ghép)
                </h4>
                <div className="space-y-4">
                  {Object.entries(groupedTables).map(([floor, floorTables]) => (
                    <div key={floor}>
                      <div className="mb-2 flex items-center justify-between">
                        <h5 className="text-[11px] font-bold text-muted-foreground/80 uppercase">
                          {floor}
                        </h5>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {floorTables.map((table) => {
                          const isSelected = selectedTableIds.includes(table.id)
                          const isMain = selectedTableIds[0] === table.id
                          return (
                            <button
                              key={table.id}
                              type="button"
                              onClick={() => toggleTableSelect(table.id)}
                              className={cn(
                                'rounded-lg border p-3 text-left transition-all relative',
                                isSelected
                                  ? isMain
                                    ? 'border-primary bg-primary/10 shadow-sm'
                                    : 'border-amber-500 bg-amber-500/10 shadow-sm'
                                  : 'border-border bg-background hover:border-primary/40 hover:bg-secondary/30',
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-serif text-base font-bold text-foreground">
                                  {table.code}
                                </span>
                                {isSelected ? (
                                  isMain ? (
                                    <Badge className="bg-primary text-primary-foreground text-[9px] font-semibold rounded-md">Bàn chính</Badge>
                                  ) : (
                                    <Badge className="bg-amber-500 text-white text-[9px] font-semibold rounded-md">Bàn ghép</Badge>
                                  )
                                ) : null}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="size-3.5" />
                                  {table.capacity} ghế
                                </span>
                                <span>{table.area}</span>
                              </div>
                              {table.notes && (
                                <p className="mt-2 text-xs italic text-muted-foreground/80">
                                  {table.notes}
                                </p>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Capacity Alerts Footer Note */}
        {selectedTableIds.length > 0 && !isLoading && availableTables.length > 0 && (
          <div className="border-t border-border px-5 py-3.5 bg-secondary/15 shrink-0 flex flex-col gap-2">
            <label className="flex items-center gap-2.5 pb-2.5 border-b border-border/50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isManualArrangement}
                onChange={(e) => {
                  setIsManualArrangement(e.target.checked)
                  if (e.target.checked) {
                    setSelectedTableIds((prev) => prev.slice(0, 1))
                  }
                }}
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <div className="leading-tight">
                <span className="font-serif text-xs font-bold text-foreground block">
                  Tự sắp xếp thêm ghế / bàn phụ ngoài hệ thống
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Nhà hàng sẽ tự bố trí vật lý, không cần ghép bàn trên ứng dụng.
                </span>
              </div>
            </label>

            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground font-semibold">Tình trạng chỗ ngồi:</span>
              <span className={cn('font-bold font-mono text-sm', hasCapacityWarning && !isManualArrangement ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400')}>
                Đã chọn: {totalCapacity} ghế / {partySize} khách
              </span>
            </div>

            {hasCapacityWarning && !isManualArrangement && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive border border-destructive/25 animate-in fade-in duration-150">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">⚠️ Thiếu chỗ phục vụ</span>
                  <span className="text-[11px] opacity-90 leading-tight">
                    Tổng số ghế của các bàn đã chọn ({totalCapacity} ghế) ít hơn số lượng khách của đặt bàn ({partySize} người). Vui lòng chọn tích thêm các bàn ghép ở lưới phía trên hoặc chọn &quot;Tự sắp xếp thêm ghế / bàn phụ ngoài hệ thống&quot;.
                  </span>
                </div>
              </div>
            )}

            {isManualArrangement && (
              <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 animate-in fade-in duration-150">
                <Check className="size-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">✓ Đã xác nhận tự bố trí</span>
                  <span className="text-[11px] opacity-90 leading-tight">
                    Admin xác nhận tự sắp xếp thêm ghế hoặc bàn phụ ngoài hệ thống cho lượt đặt bàn này.
                  </span>
                </div>
              </div>
            )}

            {showLargePartyTip && !isManualArrangement && (
              <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 p-2.5 text-xs text-blue-700 dark:text-blue-400 border border-blue-500/25 animate-in fade-in duration-150">
                <Info className="size-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">💡 Gợi ý ghép bàn</span>
                  <span className="text-[11px] opacity-90 leading-tight">
                    Đặt bàn này dành cho nhóm lớn ({partySize} khách). Vui lòng chọn thêm các bàn ghép ở lưới phía trên để ghép bàn đủ chỗ phục vụ nhóm.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buttons Action */}
        <div className="flex justify-end gap-2 border-t border-border p-4 shrink-0 bg-card">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={selectedTableIds.length === 0 || isLoading}
            onClick={() => onConfirm(selectedTableId, selectedSecondaryIds)}
            className="gap-1 shadow-xs"
          >
            <Check className="size-3.5" />
            Xác nhận bàn
          </Button>
        </div>
      </div>
    </div>
  )
}
