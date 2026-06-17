import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimePickerDropdownProps {
  slots: string[]
  selectedTime: string
  onTimeSelect: (time: string) => void
  onClose: () => void
}

export function TimePickerDropdown({ slots, selectedTime, onTimeSelect, onClose }: TimePickerDropdownProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted-foreground font-medium flex flex-col items-center justify-center gap-2">
        <Clock className="size-6 text-muted-foreground/50 animate-pulse" />
        <span>Không có khung giờ phù hợp</span>
      </div>
    )
  }

  const availableHours = Array.from(new Set(slots.map(s => s.split(':')[0]))).sort()
  const [currentHour = '', currentMinute = ''] = (selectedTime || '').split(':')
  const activeHour = availableHours.includes(currentHour)
    ? currentHour
    : availableHours[0] || ''

  const availableMinutes = slots
    .filter(s => s.startsWith(`${activeHour}:`))
    .map(s => s.split(':')[1])
    .sort()
  const activeMinute = availableMinutes.includes(currentMinute)
    ? currentMinute
    : availableMinutes[0] || ''

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 mt-1">
        {/* Hour Column Panel */}
        <div className="flex flex-col gap-1 p-1.5 bg-muted/60 dark:bg-muted/10 rounded-xl border border-border/40">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 text-center">
            Giờ
          </span>
          <div className="flex flex-col gap-1 h-36 overflow-y-auto pr-0.5 no-scrollbar">
            {availableHours.map((h) => {
              const isSelected = activeHour === h
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    const minsForH = slots.filter(s => s.startsWith(`${h}:`)).map(s => s.split(':')[1]).sort()
                    const defaultMin = minsForH.includes(currentMinute) ? currentMinute : minsForH[0] || '00'
                    onTimeSelect(`${h}:${defaultMin}`)
                  }}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer text-center",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/15 scale-102"
                      : "bg-background text-foreground border border-border/85 shadow-xs hover:border-primary/45 hover:bg-secondary/30 hover:translate-x-0.5"
                  )}
                >
                  {h}
                </button>
              )
            })}
          </div>
        </div>

        {/* Minute Column Panel */}
        <div className="flex flex-col gap-1 p-1.5 bg-muted/60 dark:bg-muted/10 rounded-xl border border-border/40">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 text-center">
            Phút
          </span>
          <div className="flex flex-col gap-1 h-36 overflow-y-auto pr-0.5 no-scrollbar">
            {availableMinutes.map((m) => {
              const isSelected = activeMinute === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    onTimeSelect(`${activeHour}:${m}`)
                  }}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer text-center",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/15 scale-102"
                      : "bg-background text-foreground border border-border/85 shadow-xs hover:border-primary/45 hover:bg-secondary/30 hover:translate-x-0.5"
                  )}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {selectedTime && (
        <div className="flex items-center justify-between gap-2 mt-1 border-t border-border/40 pt-2.5">
          <div className="flex-1 flex items-center justify-between px-2.5 py-1.5 bg-primary/5 rounded-lg border border-primary/10 h-8">
            <span className="text-[10px] text-muted-foreground font-semibold">Đã chọn:</span>
            <span className="text-xs font-bold font-mono text-primary flex items-center gap-0.5">
              <Clock className="size-3" />
              {selectedTime}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-97 shrink-0"
          >
            Xác nhận
          </Button>
        </div>
      )}
    </div>
  )
}
