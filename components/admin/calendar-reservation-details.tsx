import { Check, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Reservation } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'
import { statusText } from '@/lib/admin-calendar'

type CalendarReservationDetailsProps = {
  reservation: Reservation
  onClose: () => void
  onConfirm: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
}

export function CalendarReservationDetails({
  reservation,
  onClose,
  onConfirm,
  onCancel,
  onEdit,
}: CalendarReservationDetailsProps) {
  const now = new Date()
  const yearStr = now.getFullYear()
  const monthStr = String(now.getMonth() + 1).padStart(2, '0')
  const dayStr = String(now.getDate()).padStart(2, '0')
  const todayStr = `${yearStr}-${monthStr}-${dayStr}`
  const isPastDate = reservation.date < todayStr

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
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[58dvh] space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên khách hàng</span>
              <span className="font-serif text-base font-bold text-foreground">{reservation.name}</span>
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</span>
              <Badge
                variant="outline"
                className={cn(
                  'mt-0.5 rounded-md text-xs font-semibold',
                  reservation.status === 'confirmed'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                    : reservation.status === 'cancelled'
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-700'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-700',
                )}
              >
                {statusText(reservation.status)}
              </Badge>
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
                onClick={() => onCancel(reservation)}
                className="gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <X className="size-3.5" />
                Hủy bàn
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isPastDate && reservation.status !== 'confirmed' && (
              <Button
                type="button"
                size="sm"
                onClick={() => onConfirm(reservation)}
                className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Check className="size-3.5" />
                Gán bàn
              </Button>
            )}
            
            {!isPastDate && (
              <Button type="button" size="sm" variant="outline" onClick={() => onEdit(reservation)} className="gap-1">
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
