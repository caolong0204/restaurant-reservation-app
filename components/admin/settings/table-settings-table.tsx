import { Fragment } from 'react'
import { AlertTriangle, ChevronDown, Pencil, Table2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Reservation, RestaurantTable } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

import { TableFutureBookings } from './table-future-bookings'
import {
  STATUS_LABELS,
  STATUS_STYLES,
  StatusIcon,
} from './table-settings-shared'

export function TableSettingsTable({
  tables,
  futureCounts,
  futureReservations,
  expandedTableId,
  onToggleFutureBookings,
  onEdit,
}: {
  tables: RestaurantTable[]
  futureCounts: Record<string, number>
  futureReservations: Record<string, Reservation[]>
  expandedTableId: string | null
  onToggleFutureBookings: (tableId: string) => void
  onEdit: (table: RestaurantTable) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-secondary/45 text-left text-xs font-bold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Tên bàn</th>
              <th className="px-4 py-3">Tầng</th>
              <th className="px-4 py-3">Khu vực</th>
              <th className="px-4 py-3">Sức chứa</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Booking tương lai</th>
              <th className="px-4 py-3">Ghi chú</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {tables.map((table) => {
              const isExpanded = expandedTableId === table.id
              return (
                <Fragment key={table.id}>
                  <TableSettingsRow
                    table={table}
                    futureCount={futureCounts[table.id] ?? 0}
                    isFutureExpanded={isExpanded}
                    onToggleFutureBookings={onToggleFutureBookings}
                    onEdit={onEdit}
                  />
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="bg-amber-50/25 px-4 py-3">
                        <TableFutureBookings reservations={futureReservations[table.id] ?? []} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {tables.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Table2 className="size-8 text-muted-foreground/60" />
          <p className="font-serif font-bold text-foreground">Không tìm thấy bàn</p>
          <p className="text-sm text-muted-foreground">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      )}
    </div>
  )
}

function TableSettingsRow({
  table,
  futureCount,
  isFutureExpanded,
  onToggleFutureBookings,
  onEdit,
}: {
  table: RestaurantTable
  futureCount: number
  isFutureExpanded: boolean
  onToggleFutureBookings: (tableId: string) => void
  onEdit: (table: RestaurantTable) => void
}) {
  return (
    <tr className="hover:bg-secondary/20">
      <td className="px-4 py-3 font-serif font-bold text-foreground">{table.code}</td>
      <td className="px-4 py-3 text-muted-foreground">{table.floor}</td>
      <td className="px-4 py-3 text-foreground">{table.area}</td>
      <td className="px-4 py-3 text-foreground">{table.capacity} ghế</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold',
              STATUS_STYLES[table.availabilityStatus],
            )}
          >
            <StatusIcon status={table.availabilityStatus} />
            {STATUS_LABELS[table.availabilityStatus]}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        {futureCount > 0 ? (
          <button
            type="button"
            onClick={() => onToggleFutureBookings(table.id)}
            className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100"
          >
            <AlertTriangle className="size-3" />
            {futureCount} booking
            <ChevronDown className={cn('size-3 transition-transform', isFutureExpanded && 'rotate-180')} />
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-bold text-muted-foreground">
            0 booking
          </span>
        )}
      </td>
      <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
        {table.notes || '-'}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Sửa ${table.code}`}
          onClick={() => onEdit(table)}
        >
          <Pencil className="size-4" />
        </Button>
      </td>
    </tr>
  )
}
