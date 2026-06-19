import { Users } from 'lucide-react'
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
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Chọn bàn (Có thể chọn nhiều bàn để ghép)
      </h4>
      <div className="space-y-4">
        {Object.entries(groupedTables).map(([floor, floorTables]) => (
          <div key={floor}>
            <div className="mb-2 flex items-center justify-between">
              <h5 className="text-[11px] font-bold text-muted-foreground/80 uppercase">
                {floor}
              </h5>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {floorTables.map((table) => {
                const isSelected = selectedTableIds.includes(table.id)
                const isMain = selectedTableIds[0] === table.id
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => toggleTableSelect(table.id)}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-all relative',
                      isSelected
                        ? isMain
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-border bg-background hover:border-primary/40 hover:bg-secondary/30',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif text-base font-bold text-foreground">
                        {table.code}
                      </span>
                      {isSelected ? (
                        isMain ? (
                          <Badge className="bg-primary text-primary-foreground text-[9px] font-semibold rounded-md">Bàn chính</Badge>
                        ) : (
                          <Badge className="bg-amber-500 text-white text-[9px] font-semibold rounded-md">Bàn ghép</Badge>
                        )
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {table.capacity} ghế
                      </span>
                      <span>{table.area}</span>
                    </div>
                    {table.notes && (
                      <p className="mt-2 text-xs italic text-muted-foreground/80">
                        {table.notes}
                      </p>
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
