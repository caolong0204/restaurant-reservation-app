import { AlertTriangle, Check, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CapacityWarningAlertProps {
  cTableId: string
  totalCapacity: number
  partySize: number
  isCapacityInsufficient: boolean
  isCapacityExcessive: boolean
  cIsManualArrangement: boolean
  setCIsManualArrangement: (val: boolean) => void
  cSecondaryTableIds: string[]
  setCSecondaryTableIds: (val: string[]) => void
  showLargePartyTip: boolean
}

export function CapacityWarningAlert({
  cTableId,
  totalCapacity,
  partySize,
  isCapacityInsufficient,
  isCapacityExcessive,
  cIsManualArrangement,
  setCIsManualArrangement,
  cSecondaryTableIds,
  setCSecondaryTableIds,
  showLargePartyTip
}: CapacityWarningAlertProps) {
  if (!cTableId) return null

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 pt-3">
      {isCapacityInsufficient && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={cIsManualArrangement}
            onChange={(e) => {
              setCIsManualArrangement(e.target.checked)
              if (e.target.checked) setCSecondaryTableIds([])
            }}
            className="rounded border-input text-primary focus:ring-primary size-3.5"
          />
          <div className="leading-tight">
            <span className="text-xs font-bold text-foreground block">
              Tự sắp xếp thêm ghế / bàn phụ ngoài hệ thống
            </span>
            <span className="text-[10px] text-muted-foreground">
              Không cần ghép bàn trên ứng dụng.
            </span>
          </div>
        </label>
      )}

      <div className={cn(
        "flex flex-col gap-1.5 text-xs p-2.5 rounded-lg border transition-all duration-200",
        isCapacityInsufficient && !cIsManualArrangement
          ? "bg-destructive/5 border-destructive/20 text-destructive"
          : isCapacityExcessive
            ? "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400"
            : "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
      )}>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-semibold">Tình trạng sức chứa:</span>
          <span className={cn(
            'font-bold font-mono',
            isCapacityInsufficient && !cIsManualArrangement
              ? 'text-destructive'
              : isCapacityExcessive
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
          )}>
            Đã chọn: {totalCapacity} ghế / {partySize} khách
          </span>
        </div>
        
        {isCapacityInsufficient && !cIsManualArrangement && (
          <div className="text-[10.5px] leading-tight flex items-start gap-1 font-medium mt-1">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>
              <strong>Cảnh báo:</strong> Số lượng khách ({partySize}) nhiều hơn tổng số ghế ({totalCapacity}). Vui lòng chọn ghép thêm bàn trên lưới hoặc tích chọn tự sắp xếp thêm ghế ngoài.
            </span>
          </div>
        )}

        {isCapacityExcessive && (
          <div className="text-[10.5px] leading-tight flex items-start gap-1 font-medium mt-1">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>
              <strong>Cảnh báo dư chỗ:</strong> Tổng số ghế đã chọn ({totalCapacity}) lớn hơn số lượng khách ({partySize}). Vui lòng cân nhắc để tối ưu công suất bàn.
            </span>
          </div>
        )}

        {isCapacityInsufficient && cIsManualArrangement && (
          <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 leading-tight flex items-start gap-1 font-medium mt-1">
            <Check className="size-3.5 shrink-0" />
            <span>
              <strong>Đã duyệt ngoại lệ:</strong> Cho phép gán bàn vượt công suất. Admin chịu trách nhiệm bố trí thêm chỗ.
            </span>
          </div>
        )}

        {!isCapacityInsufficient && !isCapacityExcessive && (
          <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 leading-tight flex items-start gap-1 font-medium mt-1">
            <Check className="size-3.5 shrink-0" />
            <span>Đủ chỗ trống! Vị trí bàn hoàn toàn phù hợp với số lượng khách.</span>
          </div>
        )}
      </div>

      {showLargePartyTip && (
        <div className="flex items-start gap-1.5 rounded-lg border border-primary/20 bg-primary/10 p-2 text-[10.5px] text-primary">
          <Info className="size-3.5 shrink-0 mt-0.5" />
          <p className="font-medium leading-tight">
            <strong>Gợi ý:</strong> Với nhóm {partySize} khách, bạn có thể bấm chọn thêm các bàn trống khác (màu viền cam) để ghép bàn lại với nhau.
          </p>
        </div>
      )}
    </div>
  )
}
