import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import {
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type {
  ReservationSortField,
  ReservationSortOrder,
} from './reservation-table-utils'

export function ReservationTableHeader({
  sortField,
  sortOrder,
  onSort,
}: {
  sortField: ReservationSortField | null
  sortOrder: ReservationSortOrder | null
  onSort: (field: ReservationSortField) => void
}) {
  return (
    <TableHeader className="sticky top-0 z-10 bg-card">
      <TableRow className="border-border bg-secondary/45 hover:bg-secondary/45">
        <TableHead className="w-10 text-center font-bold text-foreground">#</TableHead>
        <SortableHead
          label="Ngày"
          field="date"
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={onSort}
          className="w-24"
        />
        <SortableHead
          label="Giờ"
          field="time"
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={onSort}
          className="w-16"
        />
        <SortableHead
          label="Tạo lúc"
          field="createdAt"
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={onSort}
          className="w-24"
        />
        <TableHead className="w-40 text-center font-bold text-foreground">Tên khách</TableHead>
        <TableHead className="w-32 text-center font-bold text-foreground">Liên hệ</TableHead>
        <TableHead className="w-20 text-center font-bold text-foreground">Số lượng</TableHead>
        <TableHead className="w-28 text-center font-bold text-foreground">Dịp đặc biệt</TableHead>
        <TableHead className="w-24 text-center font-bold text-foreground">Bàn</TableHead>
        <TableHead className="w-32 text-center font-bold text-foreground">Trạng thái</TableHead>
        <TableHead className="sticky right-0 z-20 w-24 border-l border-border bg-secondary text-center font-bold text-foreground shadow-[-3px_0_6px_-3px_rgba(0,0,0,0.12)]">
          Thao tác
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

function SortableHead({
  label,
  field,
  sortField,
  sortOrder,
  onSort,
  className,
}: {
  label: string
  field: ReservationSortField
  sortField: ReservationSortField | null
  sortOrder: ReservationSortOrder | null
  onSort: (field: ReservationSortField) => void
  className: string
}) {
  return (
    <TableHead
      className={`${className} cursor-pointer select-none text-center font-bold text-foreground transition-colors hover:bg-secondary`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-center gap-1">
        <span>{label}</span>
        {sortField === field ? (
          sortOrder === 'asc' ? (
            <ArrowUp className="size-3 text-primary" strokeWidth={3} />
          ) : (
            <ArrowDown className="size-3 text-primary" strokeWidth={3} />
          )
        ) : (
          <ArrowUpDown className="size-3 text-muted-foreground/60" strokeWidth={2.5} />
        )}
      </div>
    </TableHead>
  )
}
