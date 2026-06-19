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

const ACTIVE_TAB_STYLES: Record<string, string> = {
  all: 'border-primary text-primary bg-primary/20 dark:bg-primary/30',
  pending: 'border-amber-500 text-amber-700 bg-amber-500/20 dark:text-amber-400',
  confirmed: 'border-emerald-500 text-emerald-700 bg-emerald-500/20 dark:text-emerald-400',
  serving: 'border-blue-500 text-blue-700 bg-blue-500/20 dark:text-blue-400',
  completed: 'border-gray-500 text-gray-700 bg-gray-500/20 dark:text-gray-400',
  cancelled: 'border-rose-500 text-rose-700 bg-rose-500/20 dark:text-rose-400',
}

const TAB_STYLES: Record<string, string> = {
  all: 'border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 hover:border-primary/60',
  pending: 'border-amber-500/40 text-amber-700 bg-amber-500/5 hover:bg-amber-500/10 dark:text-amber-500 hover:border-amber-500/60',
  confirmed: 'border-emerald-500/40 text-emerald-700 bg-emerald-500/5 hover:bg-emerald-500/10 dark:text-emerald-500 hover:border-emerald-500/60',
  serving: 'border-blue-500/40 text-blue-700 bg-blue-500/5 hover:bg-blue-500/10 dark:text-blue-500 hover:border-blue-500/60',
  completed: 'border-gray-500/40 text-gray-700 bg-gray-500/5 hover:bg-gray-500/10 dark:text-gray-500 hover:border-gray-500/60',
  cancelled: 'border-rose-500/40 text-rose-700 bg-rose-500/5 hover:bg-rose-500/10 dark:text-rose-500 hover:border-rose-500/60',
}

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
                'inline-flex h-10 shrink-0 items-center gap-4 whitespace-nowrap rounded-lg border px-5 text-sm font-bold shadow-xs transition-colors',
                filter === item.value
                  ? ACTIVE_TAB_STYLES[item.value]
                  : TAB_STYLES[item.value] || 'border-border/80 bg-card text-foreground hover:border-primary/40 hover:bg-secondary/20',
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

        <div className="flex shrink-0 items-center justify-end gap-3">
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
            onClick={onCreateReservation}
            aria-label="Tạo đặt bàn"
            className="flex size-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-flambe-rust p-0 text-sm font-bold text-white shadow-xs hover:bg-flambe-rust-hover lg:h-11 lg:w-auto lg:px-6"
          >
            <Plus className="size-5" />
            <span className="hidden lg:inline">Tạo đặt bàn</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
