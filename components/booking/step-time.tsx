'use client'

import { Clock } from 'lucide-react'
import { TIME_SLOTS, formatTime } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

interface StepTimeProps {
  time: string
  setTime: (t: string) => void
}

export function StepTime({ time, setTime }: StepTimeProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-2 sm:gap-6 sm:py-4 text-center">
      <div className="flex flex-col items-center">
        <Clock className="size-6 text-primary mb-1.5 sm:size-8 sm:mb-2" />
        <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground">
          Chọn giờ dùng bữa
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Vui lòng chọn khung giờ phù hợp với kế hoạch của bạn
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 w-full mt-1 sm:mt-2">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => {
              setTime(slot)
            }}
            className={cn(
              'rounded-lg border py-2.5 text-sm font-semibold transition-all duration-200',
              time === slot
                ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/10'
                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary/40'
            )}
          >
            {formatTime(slot)}
          </button>
        ))}
      </div>
    </div>
  )
}
