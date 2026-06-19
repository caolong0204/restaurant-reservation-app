import { AlertTriangle, Check, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssignTableCapacityAlertsProps {
  selectedTableIds: string[]
  isLoading: boolean
  availableTablesLength: number
  hasCapacityWarning: boolean
  isManualArrangement: boolean
  setIsManualArrangement: (val: boolean) => void
  setSelectedTableIds: React.Dispatch<React.SetStateAction<string[]>>
  totalCapacity: number
  partySize: number
  showLargePartyTip: boolean
}

export function AssignTableCapacityAlerts({
  selectedTableIds,
  isLoading,
  availableTablesLength,
  hasCapacityWarning,
  isManualArrangement,
  setIsManualArrangement,
  setSelectedTableIds,
  totalCapacity,
  partySize,
  showLargePartyTip,
}: AssignTableCapacityAlertsProps) {
  if (!(selectedTableIds.length > 0 && !isLoading && availableTablesLength > 0 && hasCapacityWarning)) {
    return null
  }

  return (
    <div className="border-t border-border px-5 py-3.5 bg-secondary/15 shrink-0 flex flex-col gap-2">
      <label className="flex items-center gap-2.5 pb-2.5 border-b border-border/50 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isManualArrangement}
          onChange={(e) => {
            setIsManualArrangement(e.target.checked)
            if (e.target.checked) {
              setSelectedTableIds((prev) => prev.slice(0, 1))
            }
          }}
          className="rounded border-input text-primary focus:ring-primary size-4"
        />
        <div className="leading-tight">
          <span className="font-serif text-xs font-bold text-foreground block">
            Tự sắp xếp thêm ghế / bàn phụ ngoài hệ thống
          </span>
          <span className="text-[10px] text-muted-foreground">
            Nhà hàng sẽ tự bố trí vật lý, không cần ghép bàn trên ứng dụng.
          </span>
        </div>
      </label>

      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-muted-foreground font-semibold">Tình trạng chỗ ngồi:</span>
        <span className={cn('font-bold font-mono text-sm', hasCapacityWarning && !isManualArrangement ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400')}>
          Đã chọn: {totalCapacity} ghế / {partySize} khách
        </span>
      </div>

      {hasCapacityWarning && !isManualArrangement && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive border border-destructive/25 animate-in fade-in duration-150">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">⚠️ Thiếu chỗ phục vụ</span>
            <span className="text-[11px] opacity-90 leading-tight">
              Tổng số ghế của các bàn đã chọn ({totalCapacity} ghế) ít hơn số lượng khách của đặt bàn ({partySize} người). Vui lòng chọn tích thêm các bàn ghép ở lưới phía trên hoặc chọn &quot;Tự sắp xếp thêm ghế / bàn phụ ngoài hệ thống&quot;.
            </span>
          </div>
        </div>
      )}

      {isManualArrangement && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 animate-in fade-in duration-150">
          <Check className="size-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">✓ Đã xác nhận tự bố trí</span>
            <span className="text-[11px] opacity-90 leading-tight">
              Admin xác nhận tự sắp xếp thêm ghế hoặc bàn phụ ngoài hệ thống cho lượt đặt bàn này.
            </span>
          </div>
        </div>
      )}

      {showLargePartyTip && !isManualArrangement && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 p-2.5 text-xs text-blue-700 dark:text-blue-400 border border-blue-500/25 animate-in fade-in duration-150">
          <Info className="size-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">💡 Gợi ý ghép bàn</span>
            <span className="text-[11px] opacity-90 leading-tight">
              Đặt bàn này dành cho nhóm lớn ({partySize} khách). Vui lòng chọn thêm các bàn ghép ở lưới phía trên để ghép bàn đủ chỗ phục vụ nhóm.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
