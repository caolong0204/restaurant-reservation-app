'use client'

import type { SlotAvailability } from '@/lib/reservation-types'
import { formatTime, getAvailableTimeSlots, isPastTimeSlot } from '@/lib/restaurant'
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
    slots: slots
      .filter((slot) => !isPastTimeSlot(slot, date))
      .filter((slot) => slotInGroup(slot, group.from, group.to)),
  })).filter((g) => g.slots.length > 0)

  return (
    <div className="flex flex-col items-center gap-3 py-1 sm:gap-4 sm:py-2 text-center">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-1.5">
          <Clock className="size-5 text-primary sm:size-7" />
          {isLoading && <Loader2 className="size-4 sm:size-5 text-primary animate-spin" />}
        </div>
        <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
          Chọn giờ dùng bữa
        </h4>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
          Các khung giờ hết bàn sẽ tự động khóa theo lịch xác nhận của nhà hàng
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 w-full text-left">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 pl-0.5">
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
                    onClick={() => setTime(slot)}
                    disabled={isLoading}
                    className={cn(
                      'flex min-h-[38px] sm:min-h-[42px] flex-col items-center justify-center rounded-lg border px-1.5 py-1 text-xs sm:text-sm font-semibold transition-all duration-200',
                      time === slot
                        ? 'border-primary bg-primary text-primary-foreground scale-102 shadow-md shadow-primary/10'
                        : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary/40',
                      isUnavailable && time !== slot && 'border-amber-200 bg-amber-50/50 text-amber-700/80 hover:bg-amber-100 hover:border-amber-300',
                      isLoading && 'cursor-wait opacity-70',
                    )}
                  >
                    <span>{formatTime(slot)}</span>
                    {isUnavailable && (
                      <span className="mt-0.5 text-[9px] font-bold opacity-85">
                        Đợi duyệt
                      </span>
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
