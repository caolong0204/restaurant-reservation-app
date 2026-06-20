import { Plus, Search, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { StatusFilter } from './table-settings-shared'

export function TableSettingsToolbar({
  searchTerm,
  statusFilter,
  isLoading,
  onSearchTermChange,
  onStatusFilterChange,
  onRefresh,
  onCreate,
}: {
  searchTerm: string
  statusFilter: StatusFilter
  isLoading: boolean
  onSearchTermChange: (value: string) => void
  onStatusFilterChange: (value: StatusFilter) => void
  onRefresh: () => void
  onCreate: () => void
}) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(220px,420px)_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Tìm tên bàn, tầng, ghi chú..."
            className="h-9 pl-9 text-sm"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as StatusFilter)}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang dùng</option>
          <option value="held_for_walk_in">Giữ walk-in</option>
          <option value="inactive">Tắt</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Làm mới"
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
        </Button>
        <Button
          type="button"
          onClick={onCreate}
          className="bg-flambe-rust text-white hover:bg-flambe-rust-hover"
        >
          <Plus className="size-4" />
          Thêm bàn
        </Button>
      </div>
    </div>
  )
}
