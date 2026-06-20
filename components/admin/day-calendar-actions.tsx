import { CalendarDays, Plus, RefreshCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { isoFromDate } from '@/lib/admin-calendar'
import { cn } from '@/lib/utils'

export function MobileCalendarActions({
  isLoading,
  onDateChange,
  onRefresh,
  onCreateReservation,
}: {
  isLoading?: boolean
  onDateChange: (date: string) => void
  onRefresh?: () => void
  onCreateReservation?: () => void
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1.35fr)] gap-2 lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-11 justify-center gap-2 rounded-lg bg-background px-3 text-sm font-bold"
        onClick={() => onDateChange(isoFromDate(new Date()))}
      >
        <CalendarDays className="size-5" />
        Hôm nay
      </Button>
      {onRefresh && (
        <RefreshButton isLoading={isLoading} onRefresh={onRefresh} className="size-11" />
      )}
      {onCreateReservation && (
        <CreateButton onCreateReservation={onCreateReservation} className="h-11 text-sm" />
      )}
    </div>
  )
}

export function DesktopCalendarActions({
  isLoading,
  onRefresh,
  onCreateReservation,
}: {
  isLoading?: boolean
  onRefresh?: () => void
  onCreateReservation?: () => void
}) {
  return (
    <div className="hidden items-center justify-end gap-2 lg:flex">
      {onRefresh && <RefreshButton isLoading={isLoading} onRefresh={onRefresh} className="size-9" />}
      {onCreateReservation && (
        <CreateButton onCreateReservation={onCreateReservation} className="h-9 text-xs" />
      )}
    </div>
  )
}

function RefreshButton({
  isLoading,
  onRefresh,
  className,
}: {
  isLoading?: boolean
  onRefresh: () => void
  className: string
}) {
  return (
    <Button
      size="icon"
      variant="outline"
      aria-label="Làm mới dữ liệu"
      className={cn('shrink-0 rounded-lg bg-background', className)}
      onClick={onRefresh}
      disabled={isLoading}
    >
      <RefreshCcw className={cn('size-4', isLoading && 'animate-spin')} />
    </Button>
  )
}

function CreateButton({
  onCreateReservation,
  className,
}: {
  onCreateReservation: () => void
  className: string
}) {
  return (
    <Button
      aria-label="Tạo đặt bàn"
      className={cn(
        'flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 font-bold shadow-xs',
        className,
      )}
      onClick={onCreateReservation}
    >
      <Plus className="size-4" />
      <span className="truncate">Tạo đặt bàn</span>
    </Button>
  )
}
