import { Loader2 } from 'lucide-react'
import type { RestaurantTable } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

interface TableSelectionGridProps {
  groupedTables: Record<string, RestaurantTable[]>
  availableTableIds: Set<string>
  cTableId: string
  cSecondaryTableIds: string[]
  isLoadingTables: boolean
  onToggleTable: (tableId: string) => void
  variant?: 'cards' | 'chips'
}

export function TableSelectionGrid({
  groupedTables,
  availableTableIds,
  cTableId,
  cSecondaryTableIds,
  isLoadingTables,
  onToggleTable,
  variant = 'cards',
}: TableSelectionGridProps) {
  const isCompact = variant === 'chips'

  return (
    <div className={cn("flex flex-col", isCompact ? "gap-2" : "mt-1.5 gap-3")}>
      {Object.entries(groupedTables).map(([floor, floorTables]) => (
        <div key={floor} className={cn("flex flex-col", isCompact ? "gap-1" : "gap-1.5")}>
          <span className="text-[10px] font-bold uppercase text-muted-foreground/80">
            {floor}
          </span>
          <div className={cn(
            "grid gap-1.5",
            isCompact ? "grid-cols-4 sm:grid-cols-5" : "grid-cols-3 sm:grid-cols-4"
          )}>
            {floorTables.map((table) => {
              const isMain = cTableId === table.id
              const isSecondary = cSecondaryTableIds.includes(table.id)
              const isSelected = isMain || isSecondary
              const isAvailable = availableTableIds.has(table.id)
              return (
                <button
                  key={table.id}
                  type="button"
                  disabled={(!isAvailable && !isLoadingTables) || isLoadingTables}
                  onClick={() => onToggleTable(table.id)}
                  className={cn(
                    'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border text-center text-xs transition-colors',
                    isCompact ? 'min-h-10 gap-0 px-2 py-1' : 'min-h-[52px] gap-0.5 p-2',
                    isSelected
                      ? isMain
                        ? 'border-primary bg-primary/15 font-semibold text-primary shadow-xs'
                        : 'border-amber-500 bg-amber-500/15 font-semibold text-amber-700 shadow-xs'
                      : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/30',
                    !isAvailable && !isLoadingTables && 'opacity-40 cursor-not-allowed bg-muted/40 hover:border-border hover:bg-muted/40 text-muted-foreground',
                    isLoadingTables && 'opacity-75 cursor-wait bg-muted/20 border-border/60',
                  )}
                >
                  {isLoadingTables ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground/75" />
                  ) : (
                    <>
                      <span className={cn("font-serif font-bold", isCompact ? "max-w-full truncate text-[12px]" : "text-[13px]")}>
                        {table.code}
                      </span>
                      <span className={cn("opacity-80", isCompact ? "text-[9px] leading-tight" : "text-[9px]")}>
                        {isCompact ? `${table.capacity} ghế` : `${table.capacity} ghế`}
                      </span>
                      {isSelected && !isCompact && (
                        <span className={cn(
                          "absolute top-1 right-1 px-1 rounded-sm text-[8px] font-bold text-white uppercase",
                          isMain ? "bg-primary" : "bg-amber-500"
                        )}>
                          {isMain ? 'Chính' : 'Ghép'}
                        </span>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
