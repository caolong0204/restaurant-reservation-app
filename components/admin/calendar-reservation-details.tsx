import { useState, useEffect, useMemo } from 'react'
import { Check, X, Loader2 } from 'lucide-react'


import { Button } from '@/components/ui/button'
import type { Reservation, ReservationStatus } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'
import {
  STATUS_STYLES,
  getSelectableStatuses,
  getTodayIso,
  hasReservationServiceEnded,
  isPastReservation,
} from '@/lib/admin-calendar'

type CalendarReservationDetailsProps = {
  reservation: Reservation
  onClose: () => void
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onUpdateStatus: (reservation: Reservation, status: ReservationStatus) => void | Promise<boolean | void>
  isUpdatingStatus?: boolean
}

export function CalendarReservationDetails({
  reservation,
  onClose,
  onCancel,
  onEdit,
  onUpdateStatus,
  isUpdatingStatus,
}: CalendarReservationDetailsProps) {
  const todayStr = useMemo(() => getTodayIso(), [])
  const isPastDate = isPastReservation(reservation.date, todayStr)
  const isServiceEnded = hasReservationServiceEnded(reservation)

  const [localStatus, setLocalStatus] = useState<ReservationStatus>(reservation.status)
  const [isSaving, setIsSaving] = useState(false)
  const isCurrentlySaving = isSaving || isUpdatingStatus
  
  // Sync local state if parent prop changes
  useEffect(() => {
    setLocalStatus(reservation.status)
  }, [reservation.status])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in scale-in duration-200">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              Chi tiết đặt bàn
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Mã đặt bàn: {reservation.id}
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {isServiceEnded && (
          <div className="mx-5 mt-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800">
            Booking đã hết thời lượng phục vụ. Chỉ có thể cập nhật trạng thái.
          </div>
        )}

        <div className="max-h-[58dvh] space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên khách hàng</span>
              <span className="font-serif text-base font-bold text-foreground">{reservation.name}</span>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</span>
                <div className="relative inline-flex mt-0.5 group/status">
                  <select
                    aria-label="Cập nhật trạng thái"
                    value={localStatus}
                    disabled={isCurrentlySaving || (isPastDate && reservation.status === 'pending')}
                    onChange={(e) => setLocalStatus(e.target.value as ReservationStatus)}
                    className={cn(
                      'appearance-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden cursor-pointer rounded-full border pl-3 pr-7 py-1 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                      STATUS_STYLES[localStatus]
                    )}
                  >
                    {getSelectableStatuses(reservation.status, isPastDate).map(([value, label]) => (
                      <option key={value} value={value} className="text-foreground bg-background">{label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg className="size-3.5 opacity-70 transition-opacity group-hover/status:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Số điện thoại</span>
              <span className="font-mono text-foreground">{reservation.phone}</span>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Ngày đặt bàn</span>
              <span className="text-foreground">{reservation.date.split('-').reverse().join('/')}</span>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Giờ đặt bàn</span>
              <span className="text-foreground">{reservation.time}</span>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Tạo lúc</span>
              <span className="text-foreground">
                {new Date(reservation.createdAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Số lượng khách</span>
              <span className="font-bold text-foreground">{reservation.partySize} người</span>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Bàn chỉ định</span>
              <span className="font-bold text-primary">
                {reservation.table ? (
                  <>
                    {reservation.table.code}
                    {reservation.secondaryTables && reservation.secondaryTables.length > 0 && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (ghép: {reservation.secondaryTables.map((table) => table.code).join(', ')})
                      </span>
                    )}
                  </>
                ) : (
                  'Chưa gán bàn'
                )}
              </span>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Dịp đặc biệt</span>
              <span className="text-foreground">{reservation.occasion || '-'}</span>
            </div>
          </div>

          {reservation.notes && (
            <div className="rounded-lg border border-border/40 bg-secondary/35 p-3">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Ghi chú từ khách</span>
              <p className="font-serif text-sm italic text-muted-foreground/90">“{reservation.notes}”</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/20 p-4">
          <div>
            {!isPastDate && reservation.status !== 'cancelled' && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-label="Hủy đặt bàn"
                disabled={isServiceEnded}
                title={isServiceEnded ? 'Booking đã hết thời lượng phục vụ' : 'Hủy đặt bàn'}
                onClick={() => onCancel(reservation)}
                className="gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <X className="size-3.5" />
                Hủy bàn
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {localStatus !== reservation.status && (
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  setIsSaving(true)
                  const result = await onUpdateStatus(reservation, localStatus)
                  setIsSaving(false)
                  if (result !== false) onClose()
                }}
                disabled={isCurrentlySaving}
                className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isCurrentlySaving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                Lưu
              </Button>
            )}
            
            {!isPastDate && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEdit(reservation)}
                disabled={isServiceEnded}
                title={isServiceEnded ? 'Booking đã hết thời lượng phục vụ' : 'Chỉnh sửa'}
                className="gap-1"
              >
                Chỉnh sửa
              </Button>
            )}
            
            <Button
              type="button"
              size="sm"
              variant={isPastDate ? "default" : "secondary"}
              onClick={onClose}
              className="px-6"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
