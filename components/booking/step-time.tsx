'use client'

import type { SlotAvailability } from '@/lib/reservation-types'
import { formatTime, getAvailableTimeSlots, isPastTimeSlot } from '@/lib/restaurant'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

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
  { label: '☀️ Trưa', from: '10:00', to: '13:45' },
  { label: '🌤️ Chiều', from: '14:00', to: '17:45' },
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
    <div className="flex flex-col gap-3 py-0.5 text-center">
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-flambe-rust">
          <Loader2 className="size-4 animate-spin" />
          Đang kiểm tra bàn trống
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 w-full text-left">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-flambe-rust gap-2">
            <p className="text-[13px] font-medium px-4">
              Không thể đặt bàn cho hôm nay nữa, vui lòng chọn ngày khác để dùng bữa!
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 pl-0.5">
                {group.label}
              </p>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
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
                        'flex min-h-9 flex-col items-center justify-center rounded-lg border px-1.5 py-1 text-xs sm:text-sm font-semibold transition-all duration-200',
                        time === slot
                          ? 'border-flambe-rust bg-flambe-rust text-white shadow-md shadow-flambe-rust/20'
                          : 'border-border bg-background text-foreground hover:border-flambe-rust/50 hover:bg-flambe-rust/5',
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
          ))
        )}
      </div>
    </div>
  )
}
