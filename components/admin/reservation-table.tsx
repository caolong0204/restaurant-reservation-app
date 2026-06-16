'use client'

import {
  Armchair,
  Check,
  Edit3,
  Phone,
  Users,
  X,
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
import type { Reservation, ReservationStatus, RestaurantTable } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

interface ReservationTableProps {
  reservations: Reservation[]
  onConfirm: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Chờ duyệt',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
}

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  confirmed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
}

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

export function ReservationTable({
  reservations,
  onConfirm,
  onCancel,
  onEdit,
}: ReservationTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table className="min-w-[1300px] text-[13px]">
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="border-border bg-emerald-500/15 hover:bg-emerald-500/15">
            <TableHead className="w-14 text-center font-bold text-foreground">#</TableHead>
            <TableHead className="w-28 text-center font-bold text-foreground">Ngày</TableHead>
            <TableHead className="w-20 text-center font-bold text-foreground">Giờ</TableHead>
            <TableHead className="min-w-44 text-center font-bold text-foreground">Tên khách</TableHead>
            <TableHead className="w-32 text-center font-bold text-foreground">SĐT</TableHead>
            <TableHead className="w-24 text-center font-bold text-foreground">Số lượng</TableHead>
            <TableHead className="w-36 text-center font-bold text-foreground">Dịp đặc biệt</TableHead>
            <TableHead className="w-36 text-center font-bold text-foreground">Vị trí mong muốn</TableHead>
            <TableHead className="w-32 text-center font-bold text-foreground">Bàn</TableHead>
            <TableHead className="w-36 text-center font-bold text-foreground">Trạng thái</TableHead>
            <TableHead className="w-36 text-center font-bold text-foreground">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation, index) => {
            const isEven = index % 2 === 0
            const isCancelled = reservation.status === 'cancelled'

            return (
              <TableRow
                key={reservation.id}
                className={cn(
                  'border-border/70',
                  isCancelled
                    ? 'bg-zinc-100/80 hover:bg-zinc-200/80 text-muted-foreground/85 dark:bg-zinc-900/35 dark:hover:bg-zinc-900/50'
                    : cn(isEven ? 'bg-sky-100/70' : 'bg-card', 'hover:bg-primary/10 text-foreground')
                )}
              >
                <TableCell className={cn("text-center font-mono", isCancelled ? "text-muted-foreground/60" : "text-muted-foreground")}>
                  {index + 1}
                </TableCell>
                <TableCell className={cn("text-center font-mono font-semibold", isCancelled ? "text-muted-foreground/80" : "text-foreground")}>
                  {formatSheetDate(reservation.date)}
                </TableCell>
                <TableCell className={cn("text-center font-mono font-semibold", isCancelled ? "text-muted-foreground/80" : "text-foreground")}>
                  {reservation.time}
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
                <TableCell className={cn("text-center", isCancelled ? "text-muted-foreground/80" : "text-foreground")}>
                  {reservation.tableLocation || '-'}
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
                  <Badge
                    variant="outline"
                    className={cn(
                      'mx-auto rounded-md font-semibold',
                      isCancelled
                        ? 'border-rose-500/20 bg-rose-500/5 text-rose-600/70'
                        : STATUS_STYLES[reservation.status]
                    )}
                  >
                    {STATUS_LABELS[reservation.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="Sửa thông tin"
                      onClick={() => onEdit(reservation)}
                    >
                      <Edit3 className="size-3.5" />
                    </Button>

                    {reservation.status === 'pending' && (
                      <Button
                        size="icon-sm"
                        className="bg-red-600 text-white hover:bg-red-700"
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
