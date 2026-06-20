import { Check, Loader2, Sparkles, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function CreateModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="size-4" />
        </span>
        <h3 className="font-serif text-lg font-bold text-foreground">Tạo đặt bàn</h3>
      </div>
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-5" />
      </button>
    </div>
  )
}

export function CreateNotesField({
  notes,
  onNotesChange,
}: {
  notes: string
  onNotesChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="cNotes" className="text-[11px] font-bold">Ghi chú yêu cầu</Label>
      <textarea
        id="cNotes"
        name="notes"
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        rows={2}
        placeholder="Yêu cầu đặc biệt nếu có…"
        className="resize-none rounded-lg border border-input bg-background/70 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </div>
  )
}

export function CreateModalFooter({
  bookingSummary,
  isSubmitting,
  isCreateValid,
  onClose,
}: {
  bookingSummary: string
  isSubmitting: boolean
  isCreateValid: boolean
  onClose: () => void
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2.5 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="min-h-4 truncate text-xs font-semibold text-muted-foreground">
        {bookingSummary || 'Điền thông tin để tạo đặt bàn'}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 rounded-lg text-xs">
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!isCreateValid || isSubmitting}
          className="h-8 min-w-32 gap-1 rounded-lg text-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Đang xử lý…
            </>
          ) : (
            <>
              <Check className="size-3.5" />
              Xác nhận
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
