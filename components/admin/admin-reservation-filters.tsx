import { Calendar, Search } from 'lucide-react'

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
}: AdminReservationFiltersProps) {
  return (
    <div className="mt-8 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-1">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={cn(
                'rounded-none border-b-2 border-transparent px-3 py-2 text-xs font-semibold transition-colors',
                filter === item.value
                  ? 'border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label} ({counts[item.value]})
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 xl:ml-auto xl:flex-row xl:items-center xl:justify-end">
          <div className="relative w-full xl:w-[420px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm tên khách, số điện thoại, mã bàn..."
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              className="rounded-lg pl-9 text-sm placeholder:text-muted-foreground/50"
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

          <div className="relative w-full xl:w-[220px] xl:flex-none">
            <Popover open={isDateFilterOpen} onOpenChange={onDateFilterOpenChange}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'relative h-9 w-full justify-start border border-input bg-background pl-9 text-left text-sm font-normal shadow-xs',
                      !dateFilter && 'text-muted-foreground',
                    )}
                  />
                }
              >
                <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
      </div>
    </div>
  )
}
