import {
  Check,
  Clock,
  CalendarDays,
  Edit3,
  Armchair,
  Mail,
  Phone,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Reservation, type ReservationStatus } from '@/components/reservation-provider'
import { formatDate, formatTime } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

interface ReservationRowProps {
  reservation: Reservation
  onConfirm: () => void
  onCancel: () => void
  onEdit: () => void
  onDelete: () => void
}

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
}

export function ReservationRow({
  reservation,
  onConfirm,
  onCancel,
  onEdit,
  onDelete,
}: ReservationRowProps) {
  const r = reservation
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between relative overflow-hidden group">
      {/* Visual Indicator of Status */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        r.status === 'confirmed' ? 'bg-emerald-500' : r.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
      )} />

      <div className="flex flex-col gap-2.5 pl-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 font-serif text-base font-bold text-foreground">
            <UserRound className="size-4 text-muted-foreground" />
            {r.name}
          </span>
          <Badge
            variant="outline"
            className={cn('capitalize text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_STYLES[r.status])}
          >
            {r.status === 'pending' ? 'chờ duyệt' : r.status === 'confirmed' ? 'đã xác nhận' : 'đã hủy'}
          </Badge>
          {r.occasion && (
            <Badge variant="outline" className="text-xs text-muted-foreground border-border/80">
              {r.occasion}
            </Badge>
          )}
          {r.table && (
            <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-500/30 bg-emerald-500/10 dark:text-emerald-300">
              <Armchair className="mr-1 size-3" />
              {r.table.code}
            </Badge>
          )}
          {r.tableLocation && !r.table && (
            <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
              {r.tableLocation}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-primary" />
            {formatDate(r.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" />
            {formatTime(r.time)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            {r.partySize} khách
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground/80">
          <span className="flex items-center gap-1.5">
            <Mail className="size-3.5" />
            {r.email}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="size-3.5" />
            {r.phone}
          </span>
        </div>

        {r.notes && (
          <p className="max-w-xl text-pretty text-xs italic text-muted-foreground/90 bg-secondary/35 rounded-lg p-2.5 border border-border/40 font-serif">
            “{r.notes}”
          </p>
        )}
      </div>

      <div className="flex flex-wrap shrink-0 items-center gap-2 mt-2 sm:mt-0 sm:self-center">
        {r.status !== 'confirmed' && (
          <Button 
            size="sm" 
            className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" 
            onClick={onConfirm}
          >
            <Check className="size-3.5" />
            Gán bàn
          </Button>
        )}
        {r.status !== 'cancelled' && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 border-rose-200 text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 dark:border-rose-900/30 dark:hover:bg-rose-950/20"
            onClick={onCancel}
          >
            <X className="size-3.5" />
            Hủy bàn
          </Button>
        )}
        
        {/* Divider */}
        <span className="h-5 w-px bg-border/60 mx-1 hidden md:inline-block" />

        <Button
          size="sm"
          variant="ghost"
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
          title="Chỉnh sửa"
          onClick={onEdit}
        >
          <Edit3 className="size-3.5" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="size-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20"
          title="Xóa vĩnh viễn"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
