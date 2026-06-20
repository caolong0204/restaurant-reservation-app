import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import { cn } from '@/lib/utils'

export function WalkInTargetAlert({ hasWalkInTarget }: { hasWalkInTarget: boolean }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
        hasWalkInTarget
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-amber-200 bg-amber-50 text-amber-900',
      )}
    >
      {hasWalkInTarget ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      )}
      <span>
        {hasWalkInTarget
          ? 'Đang giữ đúng 1 bàn 2 ghế và 1 bàn 4 ghế cho khách walk-in.'
          : 'Nên giữ đúng 1 bàn 2 ghế và 1 bàn 4 ghế cho khách walk-in.'}
      </span>
    </div>
  )
}
