import { Badge } from '@/components/ui/badge'
import type { RestaurantTable } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

interface AssignTableGridProps {
  groupedTables: Record<string, RestaurantTable[]>
  selectedTableIds: string[]
  toggleTableSelect: (tableId: string) => void
}

export function AssignTableGrid({ groupedTables, selectedTableIds, toggleTableSelect }: AssignTableGridProps) {
  return (
    <div className="rounded-xl border border-border/60 p-5">
      <div className="space-y-6">
        {Object.entries(groupedTables).map(([floor, floorTables]) => (
          <div key={floor}>
            <h5 className="mb-3 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">
              {floor}
            </h5>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {floorTables.map((table) => {
                const isSelected = selectedTableIds.includes(table.id)
                const isMain = selectedTableIds[0] === table.id
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => toggleTableSelect(table.id)}
                    className={cn(
                      'relative flex flex-col items-center justify-center overflow-hidden rounded-xl border p-3.5 transition-all group',
                      isSelected
                        ? isMain
                          ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20'
                          : 'border-amber-500/50 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/20'
                        : 'border-border/60 bg-background hover:border-primary/40 hover:shadow-sm',
                    )}
                  >
                    <span className="font-serif text-[15px] font-bold text-foreground group-hover:text-primary transition-colors relative z-10">
                      {table.code}
                    </span>
                    <span className="mt-1 text-[11px] text-muted-foreground relative z-10">
                      {table.capacity} ghế
                    </span>
                    
                    {/* Tiny badge for main/secondary if selected */}
                    {isSelected && (
                      <div className="absolute right-1.5 top-1.5 z-10">
                        {isMain ? (
                          <Badge variant="default" className="px-1 py-0 text-[8px] font-bold leading-tight rounded-sm opacity-80">Chính</Badge>
                        ) : (
                          <Badge variant="secondary" className="border-0 bg-amber-500/20 px-1 py-0 text-[8px] font-bold leading-tight text-amber-700 rounded-sm opacity-80">Ghép</Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Background glow effect when selected */}
                    {isSelected && isMain && (
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/5 to-transparent" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
