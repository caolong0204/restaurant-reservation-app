'use client'

import type { SlotAvailability } from '@/lib/reservation-types'
import { formatTime, getAvailableTimeSlots } from '@/lib/restaurant'
import { cn } from '@/lib/utils'
import { Clock, Loader2 } from 'lucide-react'

interface StepTimeProps {
  time: string
  setTime: (t: string) => void
  availability: SlotAvailability[]
  isLoading: boolean
  error: string | null
  partySize: number
  date: string
}

const TIME_GROUPS = [
  { label: '☀️ Trưa', from: '10:00', to: '13:30' },
  { label: '🌤️ Chiều', from: '14:00', to: '17:30' },
  { label: '🌙 Tối', from: '18:00', to: '22:30' },
]

function slotInGroup(slot: string, from: string, to: string): boolean {
  return slot >= from && slot <= to
}

export function StepTime({
  time,
  setTime,
  availability,
  isLoading,
  error,
  partySize,
  date,
}: StepTimeProps) {
  const slots = getAvailableTimeSlots(partySize, date)
  const availabilityByTime = new Map(
    availability.map((slot) => [slot.time, slot.availableCount]),
  )

  const groups = TIME_GROUPS.map((group) => ({
    ...group,
    slots: slots.filter((slot) => slotInGroup(slot, group.from, group.to)),
  })).filter((g) => g.slots.length > 0)

  return (
    <div className="flex flex-col items-center gap-4 py-2 sm:gap-6 sm:py-4 text-center">
      <div className="flex flex-col items-center">
        <Clock className="size-6 text-primary mb-1.5 sm:size-8 sm:mb-2" />
        <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground">
          Chọn giờ dùng bữa
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Các khung giờ hết bàn sẽ tự động khóa theo lịch xác nhận của nhà hàng
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-medium text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Đang kiểm tra bàn trống...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 w-full text-left">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 pl-0.5">
              {group.label}
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {group.slots.map((slot) => {
                const availableCount = availabilityByTime.get(slot)
                const isUnavailable = availableCount === 0
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      if (!isUnavailable) setTime(slot)
                    }}
                    disabled={isUnavailable || isLoading}
                    className={cn(
                      'flex min-h-10 flex-col items-center justify-center rounded-lg border px-2 py-2 text-sm font-semibold transition-all duration-200',
                      time === slot
                        ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/10'
                        : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary/40',
                      isUnavailable && 'cursor-not-allowed border-border bg-muted/60 text-muted-foreground opacity-60 hover:border-border hover:bg-muted/60',
                      isLoading && 'cursor-wait opacity-70',
                    )}
                  >
                    <span>{formatTime(slot)}</span>
                    {isUnavailable && (
                      <span className="mt-0.5 text-[10px] font-medium opacity-75">Hết bàn</span>
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
