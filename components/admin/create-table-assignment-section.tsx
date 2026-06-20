import { Check, Loader2 } from 'lucide-react'

import { CapacityWarningAlert } from '@/components/admin/capacity-warning-alert'
import { TableSelectionGrid } from '@/components/admin/table-selection-grid'
import { Label } from '@/components/ui/label'
import type { RestaurantTable } from '@/lib/reservation-types'

export function CreateTableAssignmentSection({
  cTableId,
  cSecondaryTableIds,
  cIsManualArrangement,
  availableTables,
  availableTableIds,
  groupedTables,
  isLoadingTables,
  tableError,
  hasSchedulingFields,
  hasUnresolvedCapacityWarning,
  fittingTableCount,
  partySize,
  totalCapacity,
  isCapacityInsufficient,
  isCapacityExcessive,
  showLargePartyTip,
  onToggleTable,
  setCIsManualArrangement,
  setCSecondaryTableIds,
}: {
  cTableId: string
  cSecondaryTableIds: string[]
  cIsManualArrangement: boolean
  availableTables: RestaurantTable[]
  availableTableIds: Set<string>
  groupedTables: Record<string, RestaurantTable[]>
  isLoadingTables: boolean
  tableError: string | null
  hasSchedulingFields: boolean
  hasUnresolvedCapacityWarning: boolean
  fittingTableCount: number
  partySize: number
  totalCapacity: number
  isCapacityInsufficient: boolean
  isCapacityExcessive: boolean
  showLargePartyTip: boolean
  onToggleTable: (tableId: string) => void
  setCIsManualArrangement: (value: boolean) => void
  setCSecondaryTableIds: (value: string[] | ((prev: string[]) => string[])) => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/10 p-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="cTableId" className="text-xs font-bold">Gán bàn ngay</Label>
            {cTableId && (
              <button
                type="button"
                onClick={() => onToggleTable('')}
                className="cursor-pointer text-[10px] font-semibold text-destructive hover:underline"
              >
                Bỏ chọn để tạo chờ duyệt
              </button>
            )}
          </div>
          <p className="mt-0.5 text-pretty text-[10px] text-muted-foreground">
            Có thể để trống để tạo booking chờ duyệt, hoặc chọn bàn để xác nhận ngay.
          </p>
        </div>
        {isLoadingTables ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Đang kiểm tra
          </span>
        ) : null}
      </div>

      {hasSchedulingFields && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-card px-2.5 py-2 text-[11px] font-semibold text-muted-foreground">
          <span>{availableTables.length} bàn trống</span>
          <span className="text-border" aria-hidden="true">/</span>
          <span>Phù hợp: {fittingTableCount}</span>
          <span className="text-border" aria-hidden="true">/</span>
          <span>Cần {partySize} ghế</span>
        </div>
      )}

      {hasSchedulingFields && (
        <TableSelectionGrid
          groupedTables={groupedTables}
          availableTableIds={availableTableIds}
          cTableId={cTableId}
          cSecondaryTableIds={cSecondaryTableIds}
          isLoadingTables={isLoadingTables}
          onToggleTable={onToggleTable}
          variant="chips"
        />
      )}

      {tableError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive">
          {tableError}
        </div>
      )}

      {!hasSchedulingFields && (
        <div className="rounded-lg border border-border/60 bg-background px-3 py-2 text-[11px] text-muted-foreground">
          Chọn ngày, giờ và số lượng khách để kiểm tra danh sách bàn trống.
        </div>
      )}

      {hasSchedulingFields && !isLoadingTables && availableTables.length === 0 && !tableError && (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          Khung giờ này hiện không còn bàn trống. Bạn vẫn có thể tạo booking pending nếu bỏ trống phần gán bàn.
        </div>
      )}

      {cTableId && !hasUnresolvedCapacityWarning && (
        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700">
          <Check className="size-3.5" />
          Đủ chỗ cho {partySize} khách
        </div>
      )}

      {(isCapacityInsufficient || isCapacityExcessive || showLargePartyTip) && (
        <CapacityWarningAlert
          cTableId={cTableId}
          totalCapacity={totalCapacity}
          partySize={partySize}
          isCapacityInsufficient={isCapacityInsufficient}
          isCapacityExcessive={isCapacityExcessive}
          cIsManualArrangement={cIsManualArrangement}
          setCIsManualArrangement={setCIsManualArrangement}
          setCSecondaryTableIds={setCSecondaryTableIds}
          showLargePartyTip={showLargePartyTip}
        />
      )}
    </div>
  )
}
