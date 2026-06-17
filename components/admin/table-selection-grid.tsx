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
}

export function TableSelectionGrid({
  groupedTables,
  availableTableIds,
  cTableId,
  cSecondaryTableIds,
  isLoadingTables,
  onToggleTable
}: TableSelectionGridProps) {
  return (
    <div className="flex flex-col gap-3 mt-1.5">
      {Object.entries(groupedTables).map(([floor, floorTables]) => (
        <div key={floor} className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
            {floor}
          </span>
          <div className="grid gap-1.5 grid-cols-3 sm:grid-cols-4">
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
                    'rounded-lg border p-2 text-center transition-all flex flex-col items-center justify-center gap-0.5 text-xs relative cursor-pointer min-h-[52px]',
                    isSelected
                      ? isMain
                        ? 'border-primary bg-primary/15 text-primary font-semibold shadow-sm'
                        : 'border-amber-500 bg-amber-500/15 text-amber-700 font-semibold shadow-xs'
                      : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/30',
                    !isAvailable && !isLoadingTables && 'opacity-40 cursor-not-allowed bg-muted/40 hover:border-border hover:bg-muted/40 text-muted-foreground',
                    isLoadingTables && 'opacity-75 cursor-wait bg-muted/20 border-border/60',
                  )}
                >
                  {isLoadingTables ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground/75" />
                  ) : (
                    <>
                      <span className="font-serif font-bold text-[13px]">{table.code}</span>
                      <span className="text-[9px] opacity-80">{table.capacity} ghế</span>
                      {isSelected && (
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
