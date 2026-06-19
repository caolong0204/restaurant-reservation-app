import {
  Check,
  Clock,
  CalendarDays,
  Edit3,
  Armchair,

  Phone,
  Trash2,
  UserRound,
  Users,
  X,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Reservation, type ReservationStatus } from '@/components/reservation-provider'
import { formatDate, formatTime } from '@/lib/restaurant'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, STATUS_STYLES, ROW_BG_STYLES, hasReservationServiceEnded } from '@/lib/admin-calendar'

interface ReservationRowProps {
  reservation: Reservation
  onConfirm: () => void
  onCancel: () => void
  onEdit: () => void
  onDelete: () => void
  onUpdateStatus: (newStatus: ReservationStatus) => void
  isUpdatingStatus?: boolean
}



export function ReservationRow({
  reservation,
  onConfirm,
  onCancel,
  onEdit,
  onDelete,
  onUpdateStatus,
  isUpdatingStatus,
}: ReservationRowProps) {
  const r = reservation
  const isServiceEnded = hasReservationServiceEnded(r)
  return (
    <div className={cn(
      "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between relative overflow-hidden group",
      ROW_BG_STYLES[r.status]
    )}>
      {/* Visual Indicator of Status */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        r.status === 'confirmed' ? 'bg-blue-500' :
        r.status === 'arrived' ? 'bg-emerald-500' :
        r.status === 'seated' ? 'bg-purple-500' :
        r.status === 'completed' ? 'bg-gray-500' :
        r.status === 'cancelled' ? 'bg-rose-500' :
        r.status === 'no_show' ? 'bg-red-500' :
        'bg-amber-500'
      )} />

      <div className="flex flex-col gap-2.5 pl-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 font-serif text-base font-bold text-foreground">
            <UserRound className="size-4 text-muted-foreground" />
            {r.name}
          </span>
          <div className="relative inline-flex group/status">
            <select
              value={r.status}
              disabled={isUpdatingStatus}
              onChange={(e) => onUpdateStatus(e.target.value as ReservationStatus)}
              className={cn(
                'appearance-none outline-none cursor-pointer rounded-full border pl-2 pr-5 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                STATUS_STYLES[r.status]
              )}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="text-foreground bg-background">{label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5">
              {isUpdatingStatus ? (
                <Loader2 className="size-3 animate-spin opacity-70" />
              ) : (
                <svg className="size-3 opacity-50 transition-opacity group-hover/status:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              )}
            </div>
          </div>
          {r.occasion && (
            <Badge variant="outline" className="text-xs text-muted-foreground border-border/80">
              {r.occasion}
            </Badge>
          )}
          {r.table && (
            <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-500/30 bg-emerald-500/10 dark:text-emerald-300">
              <Armchair className="mr-1 size-3" />
              {r.table.code}
              {r.secondaryTables && r.secondaryTables.length > 0 && ` + ${r.secondaryTables.map((t) => t.code).join(' + ')}`}
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
            disabled={isServiceEnded}
            title={isServiceEnded ? 'Booking đã hết thời lượng phục vụ' : 'Gán bàn'}
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
            disabled={isServiceEnded}
            title={isServiceEnded ? 'Booking đã hết thời lượng phục vụ' : 'Hủy bàn'}
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
          title={isServiceEnded ? 'Booking đã hết thời lượng phục vụ' : 'Chỉnh sửa'}
          disabled={isServiceEnded}
          onClick={onEdit}
        >
          <Edit3 className="size-3.5" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="size-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20"
          title={isServiceEnded ? 'Booking đã hết thời lượng phục vụ' : 'Xóa vĩnh viễn'}
          disabled={isServiceEnded}
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
