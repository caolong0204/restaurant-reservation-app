'use client'

import { useEffect, useMemo, useState } from 'react'
import { Armchair, Check, Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Reservation, RestaurantTable } from '@/lib/reservation-types'
import { formatDate, formatTime } from '@/lib/restaurant'
import { AssignTableGrid } from './assign-table-grid'
import { AssignTableCapacityAlerts } from './assign-table-capacity-alerts'

interface AssignTableModalProps {
  isOpen: boolean
  reservation: Reservation | null
  availableTables: RestaurantTable[]
  isLoading: boolean
  onClose: () => void
  onConfirm: (tableId: string, secondaryTableIds: string[], manualArrangement: boolean) => void | Promise<void>
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const bestFitTable = useMemo(() => {
    if (reservation && reservation.partySize <= 4) {
      return availableTables.find((t) => t.capacity >= reservation.partySize) || availableTables[0]
    }
    return availableTables[0]
  }, [availableTables, reservation])

  useEffect(() => {
    if (bestFitTable && reservation) {
      setSelectedTableIds([bestFitTable.id])
      setIsManualArrangement(false)
    } else {
      setSelectedTableIds([])
      setIsManualArrangement(false)
    }
  }, [bestFitTable, reservation])

  // Manual arrangement is only an explicit override when selected tables are short on capacity.
  useEffect(() => {
    if (selectedTableIds.length > 0 && reservation) {
      const mainTab = availableTables.find((t) => t.id === selectedTableIds[0])
      if (mainTab) {
        const selectedSecondaryIds = selectedTableIds.slice(1)
        const selectedSecondaryTables = availableTables.filter((t) => selectedSecondaryIds.includes(t.id))
        const selectedCapacity =
          mainTab.capacity + selectedSecondaryTables.reduce((sum, table) => sum + table.capacity, 0)

        if (selectedCapacity >= reservation.partySize) setIsManualArrangement(false)
      }
    }
  }, [selectedTableIds, availableTables, reservation])

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

  const hasCapacityWarning = Boolean(selectedTableId && totalCapacity < partySize)
  const showLargePartyTip = Boolean(selectedTableId && partySize > 4 && mainTable && mainTable.capacity < partySize && selectedSecondaryIds.length === 0)
  const isConfirmDisabled = Boolean(
    selectedTableIds.length === 0 ||
    isLoading ||
    (hasCapacityWarning && !isManualArrangement),
  )

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
        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[1px]">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-bold text-foreground">Đang xác nhận bàn...</p>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5 shrink-0 bg-secondary/10">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">
              Xác nhận gán bàn
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-foreground">{reservation.name}</span>
              <span>•</span>
              <span>{formatDate(reservation.date)}</span>
              <span>•</span>
              <span className="font-medium text-foreground">{formatTime(reservation.time)}</span>
              <span>•</span>
              <span className="bg-secondary px-1.5 py-0.5 rounded text-xs font-semibold text-foreground">{reservation.partySize} khách</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-45"
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
              <h4 className="mb-3 font-bold text-foreground text-[15px]">Bàn chỉ định</h4>
              <AssignTableGrid 
                groupedTables={groupedTables}
                selectedTableIds={selectedTableIds}
                toggleTableSelect={toggleTableSelect}
              />
            </div>
          )}
        </div>

        {/* Dynamic Capacity Alerts Footer Note */}
        <AssignTableCapacityAlerts
          selectedTableIds={selectedTableIds}
          isLoading={isLoading}
          availableTablesLength={availableTables.length}
          hasCapacityWarning={hasCapacityWarning}
          isManualArrangement={isManualArrangement}
          setIsManualArrangement={setIsManualArrangement}
          setSelectedTableIds={setSelectedTableIds}
          totalCapacity={totalCapacity}
          partySize={partySize}
          showLargePartyTip={showLargePartyTip}
        />

        {/* Buttons Action */}
        <div className="flex justify-end gap-2 border-t border-border p-4 shrink-0 bg-card">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              aria-busy={isSubmitting}
              disabled={isConfirmDisabled || isSubmitting}
              onClick={async () => {
                setIsSubmitting(true)
                try {
                  await onConfirm(selectedTableId, selectedSecondaryIds, isManualArrangement)
                } finally {
                  setIsSubmitting(false)
                }
              }}
              className="gap-1 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Xác nhận bàn
                </>
              )}
            </Button>
          </div>
      </div>
    </div>
  )
}

