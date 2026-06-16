'use client'

import { useEffect, useMemo, useState } from 'react'
import { Armchair, Check, Loader2, Users, X } from 'lucide-react'

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
  onConfirm: (tableId: string) => void
}

export function AssignTableModal({
  isOpen,
  reservation,
  availableTables,
  isLoading,
  onClose,
  onConfirm,
}: AssignTableModalProps) {
  const [selectedTableId, setSelectedTableId] = useState('')

  const bestFitTable = useMemo(() => availableTables[0], [availableTables])

  useEffect(() => {
    setSelectedTableId(bestFitTable?.id ?? '')
  }, [bestFitTable?.id])

  if (!isOpen || !reservation) return null

  const groupedTables = availableTables.reduce<Record<string, RestaurantTable[]>>((acc, table) => {
    acc[table.floor] = [...(acc[table.floor] ?? []), table]
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative max-h-[90dvh] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in scale-in duration-200">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="flex items-start justify-between border-b border-border p-5">
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

        <div className="max-h-[58dvh] overflow-y-auto p-5">
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
                  Khung giờ này không có bàn đủ sức chứa sau khi tính cửa sổ phục vụ 120 phút.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedTables).map(([floor, floorTables]) => (
                <div key={floor}>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {floor}
                    </h4>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {floorTables.length} bàn trống
                    </Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {floorTables.map((table) => {
                      const isSelected = selectedTableId === table.id
                      return (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => setSelectedTableId(table.id)}
                          className={cn(
                            'rounded-lg border p-3 text-left transition-all',
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-border bg-background hover:border-primary/40 hover:bg-secondary/30',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-serif text-base font-bold text-foreground">
                              {table.code}
                            </span>
                            {isSelected && <Check className="size-4 text-primary" />}
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
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!selectedTableId || isLoading}
            onClick={() => onConfirm(selectedTableId)}
            className="gap-1"
          >
            <Check className="size-3.5" />
            Xác nhận bàn
          </Button>
        </div>
      </div>
    </div>
  )
}
