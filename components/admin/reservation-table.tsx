'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import {
  Armchair,
  Check,
  Edit3,
  Phone,
  Users,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { STATUS_LABELS, STATUS_STYLES, ROW_BG_STYLES, getSelectableStatuses, getTodayIso, isPastReservation } from '@/lib/admin-calendar'
import type { Reservation, ReservationStatus, RestaurantTable } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

interface ReservationTableProps {
  reservations: Reservation[]
  onConfirm: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onUpdateStatus: (reservation: Reservation, newStatus: ReservationStatus) => void
  className?: string
  rowSlots?: number
  currentPage?: number
  pageSize?: number
  updatingStatusId?: string | null
}



const TABLE_COLUMN_COUNT = 11

function formatSheetDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${day}/${month}/${year}`
}

function formatTableShorthand(table: RestaurantTable): string {
  const numMatch = table.code.match(/\d+/)
  const num = numMatch ? numMatch[0].padStart(2, '0') : '00'
  const floorStr = table.floor === 'Tầng 1' ? 'T1' : 'T2'
  return `${num}(${floorStr})`
}

function formatTableDisplay(reservation: Reservation): string {
  if (!reservation.table) return ''
  const main = formatTableShorthand(reservation.table)
  if (!reservation.secondaryTables || reservation.secondaryTables.length === 0) return main
  const secondary = reservation.secondaryTables.map(formatTableShorthand).join(' + ')
  return `${main} + ${secondary}`
}

const ReservationTableRow = memo(function ReservationTableRow({
  reservation,
  displayIndex,
  nowMs,
  todayStr,
  onConfirm,
  onEdit,
  onCancel,
  onUpdateStatus,
  isUpdatingStatus,
}: {
  reservation: Reservation
  displayIndex: number
  nowMs: number
  todayStr: string
  onConfirm: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
  onUpdateStatus: (reservation: Reservation, newStatus: ReservationStatus) => void
  isUpdatingStatus?: boolean
}) {
  const isCancelled = reservation.status === 'cancelled'
  const isPending = reservation.status === 'pending'
  
  // Logic: Mới tạo trong vòng 15 phút
  const isNew = nowMs > 0 && (nowMs - reservation.createdAt) < 15 * 60 * 1000
  
  // Logic: Đã quá giờ đặt bàn 15 phút (chỉ tính những đơn đang chờ duyệt)
  const [year, month, day] = reservation.date.split('-').map(Number)
  const [hour, minute] = reservation.time.split(':').map(Number)
  // Ensure valid date parsed before comparing
  const resTimeMs = (year && month && day && !isNaN(hour) && !isNaN(minute)) 
    ? new Date(year, month - 1, day, hour, minute).getTime() 
    : Infinity
  const isOverdue = isPending && (nowMs > resTimeMs + 15 * 60 * 1000)

  // Check if date is in the past
  const isPastDate = isPastReservation(reservation.date, todayStr)

  const bgClass = isNew && isPending
    ? 'bg-orange-50/50 hover:bg-orange-100/60 dark:bg-orange-950/20 dark:hover:bg-orange-950/30'
    : ROW_BG_STYLES[reservation.status] || 'hover:bg-muted/50 text-foreground'

  // If there are specific text overrides in ROW_BG_STYLES, we use them. Otherwise, default text colors apply.
  const stickyBgClass = bgClass // re-use the same background class for sticky columns

  return (
    <TableRow
      className={cn(
        'h-[68px] border-b border-border/60 transition-colors group relative',
        bgClass
      )}
    >
      <TableCell className={cn("text-center font-mono", isCancelled ? "text-muted-foreground/60" : "text-muted-foreground")}>
        {displayIndex}
      </TableCell>
      <TableCell className={cn("text-center font-mono font-semibold", isCancelled ? "text-muted-foreground/80" : "text-foreground")}>
        {formatSheetDate(reservation.date)}
      </TableCell>
      <TableCell className={cn("text-center font-mono font-semibold", isCancelled ? "text-muted-foreground/80" : "text-foreground")}>
        {isOverdue ? (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-red-600 border border-red-100">
            <AlertTriangle className="size-3.5" />
            <span className="animate-pulse">{reservation.time}</span>
          </div>
        ) : (
          reservation.time
        )}
      </TableCell>
      <TableCell className={cn("text-center font-mono", isCancelled ? "text-muted-foreground/40" : "text-muted-foreground/70")}>
        <div className="text-[10px] leading-tight whitespace-nowrap">
          {new Date(reservation.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}-{new Date(reservation.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <button
          type="button"
          onClick={() => onEdit(reservation)}
          className={cn(
            "mx-auto max-w-44 truncate text-center font-semibold block",
            isCancelled ? "text-muted-foreground hover:text-primary" : "text-foreground hover:text-primary"
          )}
          title={reservation.name}
        >
          {isNew && (
            <span className="mr-1.5 inline-flex animate-pulse items-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-white">
              Mới
            </span>
          )}
          {reservation.name}
        </button>
        {reservation.notes && (
          <p className={cn(
            "mx-auto mt-0.5 max-w-48 truncate text-[11px] text-center",
            isCancelled ? "text-muted-foreground/60" : "text-muted-foreground"
          )} title={reservation.notes}>
            {reservation.notes}
          </p>
        )}
        {/* Glow border for new bookings */}
        {isNew && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 shadow-[2px_0_8px_rgba(251,146,60,0.5)]" />}
      </TableCell>
      <TableCell className={cn("text-center font-mono", isCancelled ? "text-muted-foreground/80" : "text-foreground")}>
        <span className="inline-flex items-center justify-center gap-1">
          <Phone className={cn("size-3", isCancelled ? "text-muted-foreground/60" : "text-muted-foreground")} />
          {reservation.phone}
        </span>
      </TableCell>
      <TableCell className={cn("text-center font-mono font-bold", isCancelled ? "text-muted-foreground/80" : "text-foreground")}>
        <span className="inline-flex items-center justify-center gap-1">
          {reservation.partySize}
          <Users className={cn("size-3", isCancelled ? "text-muted-foreground/60" : "text-muted-foreground")} />
        </span>
      </TableCell>
      <TableCell className={cn("text-center", isCancelled ? "text-muted-foreground/80" : "text-foreground")}>
        {reservation.occasion || '-'}
      </TableCell>

      <TableCell className="text-center">
        {reservation.table ? (
          <Badge variant="outline" className="mx-auto rounded-md border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
            <Armchair className="mr-1 size-3" />
            {formatTableDisplay(reservation)}
          </Badge>
        ) : (
          <button
            type="button"
            onClick={() => onConfirm(reservation)}
            className="mx-auto inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-800 hover:bg-amber-500/20"
          >
            <Armchair className="size-3" />
            Gán bàn
          </button>
        )}
      </TableCell>
      <TableCell className="text-center">
        <div className="relative inline-flex group/status">
          <select
            aria-label="Cập nhật trạng thái"
            value={reservation.status}
            disabled={isUpdatingStatus || (isPastDate && reservation.status === 'pending')}
            onChange={(e) => onUpdateStatus(reservation, e.target.value as ReservationStatus)}
            className={cn(
              'appearance-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden cursor-pointer rounded-full border pl-3 pr-7 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              STATUS_STYLES[reservation.status]
            )}
          >
            {getSelectableStatuses(reservation.status, isPastDate).map(([value, label]) => (
              <option key={value} value={value} className="text-foreground bg-background">{label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            {isUpdatingStatus ? (
              <Loader2 className="size-3.5 animate-spin opacity-70" />
            ) : (
              <svg className="size-3.5 opacity-70 transition-opacity group-hover/status:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className={cn("sticky right-0 z-10 border-l border-border shadow-[-3px_0_6px_-3px_rgba(0,0,0,0.12)] text-center", stickyBgClass)}>
        {isPastDate ? (
          <span className="text-xs text-muted-foreground/50 italic">-</span>
        ) : (
          <div className="flex justify-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Sửa thông tin"
              title="Sửa thông tin"
              onClick={() => onEdit(reservation)}
            >
              <Edit3 className="size-3.5" />
            </Button>

            {reservation.status === 'pending' && (
              <Button
                size="icon-sm"
                className="bg-red-600 text-white hover:bg-red-700"
                aria-label="Hủy booking"
                title="Hủy booking"
                onClick={() => onCancel(reservation)}
              >
                <X className="size-3.5" />
              </Button>
            )}

            {reservation.status !== 'confirmed' && (
              <Button
                size="icon-sm"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                title="Gán bàn và xác nhận"
                onClick={() => onConfirm(reservation)}
              >
                <Check className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  )
})

export function ReservationTable({
  reservations,
  onConfirm,
  onCancel,
  onEdit,
  onUpdateStatus,
  className,
  rowSlots = 10,
  currentPage = 1,
  pageSize = rowSlots,
  updatingStatusId,
}: ReservationTableProps) {
  const [sortField, setSortField] = useState<'date' | 'time' | 'createdAt' | null>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('desc')

  // Maintain stable time references to satisfy React's purity rules
  const [nowMs, setNowMs] = useState<number | null>(null)
  const todayStr = useMemo(() => getTodayIso(), [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setNowMs(now.getTime())
    }
    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const handleSort = (field: 'date' | 'time' | 'createdAt') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const displayReservations = sortField && sortOrder
    ? [...reservations].sort((a, b) => {
        if (sortField === 'date') {
          const dateCompare = a.date.localeCompare(b.date)
          if (dateCompare !== 0) {
            return sortOrder === 'asc' ? dateCompare : -dateCompare
          }
          const timeCompare = a.time.localeCompare(b.time)
          if (timeCompare !== 0) return timeCompare
          return a.createdAt - b.createdAt
        } else if (sortField === 'time') {
          const timeCompare = a.time.localeCompare(b.time)
          if (timeCompare !== 0) {
            return sortOrder === 'asc' ? timeCompare : -timeCompare
          }
          const dateCompare = a.date.localeCompare(b.date)
          if (dateCompare !== 0) return dateCompare
          return a.createdAt - b.createdAt
        } else {
          const createdCompare = a.createdAt - b.createdAt
          if (createdCompare !== 0) {
            return sortOrder === 'asc' ? createdCompare : -createdCompare
          }
          const dateCompare = a.date.localeCompare(b.date)
          if (dateCompare !== 0) return dateCompare
          return a.time.localeCompare(b.time)
        }
      })
    : reservations

  const startIndex = (currentPage - 1) * pageSize
  const visibleReservations = displayReservations.slice(startIndex, startIndex + pageSize)
  const placeholderRows = Math.max(0, rowSlots - visibleReservations.length)

  return (
    <div className={cn("flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs", className)}>
      <div className="min-h-0 flex-1 overflow-auto">
        <Table className="min-w-[1300px] text-[13px]">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="border-border bg-emerald-500/15 hover:bg-emerald-500/15">
              <TableHead className="w-14 text-center font-bold text-foreground">#</TableHead>
              <TableHead 
                className="w-28 text-center font-bold text-foreground cursor-pointer select-none hover:bg-emerald-500/25 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Ngày</span>
                  {sortField === 'date' ? (
                    sortOrder === 'asc' ? <ArrowUp className="size-3 text-primary" strokeWidth={3} /> : <ArrowDown className="size-3 text-primary" strokeWidth={3} />
                  ) : (
                    <ArrowUpDown className="size-3 text-muted-foreground/60" strokeWidth={2.5} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="w-20 text-center font-bold text-foreground cursor-pointer select-none hover:bg-emerald-500/25 transition-colors"
                onClick={() => handleSort('time')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Giờ</span>
                  {sortField === 'time' ? (
                    sortOrder === 'asc' ? <ArrowUp className="size-3 text-primary" strokeWidth={3} /> : <ArrowDown className="size-3 text-primary" strokeWidth={3} />
                  ) : (
                    <ArrowUpDown className="size-3 text-muted-foreground/60" strokeWidth={2.5} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="w-24 text-center font-bold text-foreground cursor-pointer select-none hover:bg-emerald-500/25 transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Tạo lúc</span>
                  {sortField === 'createdAt' ? (
                    sortOrder === 'asc' ? <ArrowUp className="size-3 text-primary" strokeWidth={3} /> : <ArrowDown className="size-3 text-primary" strokeWidth={3} />
                  ) : (
                    <ArrowUpDown className="size-3 text-muted-foreground/60" strokeWidth={2.5} />
                  )}
                </div>
              </TableHead>
              <TableHead className="min-w-44 text-center font-bold text-foreground">Tên khách</TableHead>
              <TableHead className="w-32 text-center font-bold text-foreground">SĐT</TableHead>
              <TableHead className="w-24 text-center font-bold text-foreground">Số lượng</TableHead>
              <TableHead className="w-36 text-center font-bold text-foreground">Dịp đặc biệt</TableHead>

              <TableHead className="w-32 text-center font-bold text-foreground">Bàn</TableHead>
              <TableHead className="w-36 text-center font-bold text-foreground">Trạng thái</TableHead>
              <TableHead className="w-36 text-center font-bold text-foreground sticky right-0 z-20 bg-[#dbf4ec] border-l border-border shadow-[-3px_0_6px_-3px_rgba(0,0,0,0.12)]">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleReservations.map((reservation, idx) => (
              <ReservationTableRow
                key={reservation.id}
                reservation={reservation}
                displayIndex={startIndex + idx + 1}
                nowMs={nowMs ?? 0}
                todayStr={todayStr || '2000-01-01'}
                onConfirm={onConfirm}
                onCancel={onCancel}
                onEdit={onEdit}
                onUpdateStatus={onUpdateStatus}
                isUpdatingStatus={updatingStatusId === reservation.id}
              />
            ))}
            {Array.from({ length: placeholderRows }).map((_, index) => (
              <TableRow
                key={`placeholder-row-${index}`}
                aria-hidden="true"
                className="h-[68px] border-border/50 bg-muted/20 hover:bg-muted/20"
              >
                <TableCell colSpan={TABLE_COLUMN_COUNT} className="p-0" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
