import { Calendar, Plus, RefreshCcw, Search } from 'lucide-react'
import { STATUS_TEXT_COLORS } from '@/lib/admin-calendar'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import { formatDate } from '@/lib/restaurant'
import { cn } from '@/lib/utils'
import type { AdminFilter } from '@/lib/hooks/use-admin-reservation-filters'

type FilterOption = { value: AdminFilter; label: string }

type AdminReservationFiltersProps = {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  dateFilter: string
  onDateFilterChange: (value: string) => void
  isDateFilterOpen: boolean
  onDateFilterOpenChange: (value: boolean) => void
  filter: AdminFilter
  onFilterChange: (value: AdminFilter) => void
  counts: Record<AdminFilter, number>
  filters: FilterOption[]
  onCreateReservation: () => void
  onRefresh: () => void
  isRefreshing: boolean
}

export function AdminReservationFilters({
  searchTerm,
  onSearchTermChange,
  dateFilter,
  onDateFilterChange,
  isDateFilterOpen,
  onDateFilterOpenChange,
  filter,
  onFilterChange,
  counts,
  filters,
  onCreateReservation,
  onRefresh,
  isRefreshing,
}: AdminReservationFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar flex w-full flex-nowrap gap-4 overflow-x-auto pb-1 xl:w-auto">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-4 whitespace-nowrap rounded-lg border bg-card px-5 text-sm font-bold shadow-xs transition-colors',
                filter === item.value
                  ? 'border-red-500 text-red-700'
                  : 'border-border/80 text-foreground hover:border-primary/40 hover:bg-secondary/20',
              )}
            >
              <span>{item.label}</span>
              {item.value !== 'all' ? (
                <span
                  className={cn(
                    'font-mono text-sm tabular-nums',
                    STATUS_TEXT_COLORS[item.value]
                  )}
                >
                  {counts[item.value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative w-full xl:w-[460px]">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-flambe-espresso" />
            <Input
              aria-label="Tìm kiếm đặt bàn"
              name="reservation-search"
              type="text"
              placeholder="Tìm tên khách, số điện thoại, mã bàn…"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              className="h-11 rounded-lg border-border/80 bg-card pl-12 pr-12 text-sm shadow-xs placeholder:text-muted-foreground/70"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchTermChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="relative w-full xl:w-[230px] xl:flex-none">
            <Popover open={isDateFilterOpen} onOpenChange={onDateFilterOpenChange}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'relative h-11 w-full justify-start rounded-lg border border-border/80 bg-card pl-12 text-left text-sm font-normal shadow-xs',
                      !dateFilter && 'text-muted-foreground',
                    )}
                  />
                }
              >
                <Calendar className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-flambe-espresso" />
                {dateFilter ? formatDate(dateFilter) : 'Tất cả ngày'}
              </PopoverTrigger>
              <PopoverContent className="animate-in fade-in-50 slide-in-from-top-1 w-auto border-none p-0 duration-150" align="end">
                <RestaurantCalendar
                  selected={dateFilter ? new Date(`${dateFilter}T00:00:00`) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      onDateFilterChange(`${year}-${month}-${day}`)
                    } else {
                      onDateFilterChange('')
                    }
                    onDateFilterOpenChange(false)
                  }}
                />
                {dateFilter && (
                  <div className="flex justify-end border-t border-border bg-background p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => {
                        onDateFilterChange('')
                        onDateFilterOpenChange(false)
                      }}
                    >
                      Xóa lọc ngày
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Làm mới dữ liệu"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="size-11 rounded-lg bg-card shadow-xs"
          >
            <RefreshCcw className={cn('size-4', isRefreshing && 'animate-spin')} />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onCreateReservation}
            className="h-11 shrink-0 gap-2 rounded-lg bg-flambe-rust px-6 text-sm font-bold text-white shadow-xs hover:bg-flambe-rust-hover"
          >
            <Plus className="size-5" />
            Tạo đặt bàn
          </Button>
        </div>
      </div>
    </div>
  )
}
