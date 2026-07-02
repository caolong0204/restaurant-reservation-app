'use client'

import { useState, useTransition } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

import { updateOperatingHoursSettings } from '@/lib/admin-settings-actions'
import type { OperatingHoursSnapshot, RestaurantWeeklyHour } from '@/lib/reservation-types'
import { formatOperatingHoursLabels, TIME_SLOTS } from '@/lib/restaurant'

const WEEKDAY_LABELS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']
const TIME_OPTIONS = TIME_SLOTS.filter((time) => time >= '06:00' && time <= '23:45')

export function OperatingHoursSettings({
  snapshot,
  onSaved,
}: {
  snapshot: OperatingHoursSnapshot
  onSaved: (snapshot: OperatingHoursSnapshot) => void
}) {
  const [weeklyHours, setWeeklyHours] = useState(snapshot.weeklyHours)
  const [showClosedDays, setShowClosedDays] = useState(
    snapshot.displaySettings.showClosedDaysInFooter,
  )
  const [isPending, startTransition] = useTransition()
  const previewLabels = formatOperatingHoursLabels(weeklyHours, { showClosedDays })

  const updateDay = (weekday: number, patch: Partial<RestaurantWeeklyHour>) => {
    setWeeklyHours((current) =>
      current.map((item) => (item.weekday === weekday ? { ...item, ...patch } : item)),
    )
  }

  const save = () => {
    startTransition(async () => {
      const result = await updateOperatingHoursSettings({
        weeklyHours,
        displaySettings: { showClosedDaysInFooter: showClosedDays },
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setWeeklyHours(result.data.weeklyHours)
      setShowClosedDays(result.data.displaySettings.showClosedDaysInFooter)
      onSaved(result.data)
      toast.success('Đã lưu giờ hoạt động')
    })
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        <div className="grid grid-cols-[100px_80px_repeat(3,minmax(120px,1fr))] gap-2 border-b border-border bg-secondary/45 px-3 py-2 text-xs font-bold uppercase text-muted-foreground">
          <span>Ngày</span>
          <span>Mở</span>
          <span>Giờ mở</span>
          <span>Giờ đóng</span>
          <span>Nhận khách cuối</span>
        </div>
        <div className="divide-y divide-border/70">
          {weeklyHours.map((hour) => (
            <div
              key={hour.weekday}
              className="grid grid-cols-[100px_80px_repeat(3,minmax(120px,1fr))] items-center gap-2 px-3 py-2"
            >
              <span className="text-sm font-bold text-foreground">
                {WEEKDAY_LABELS[hour.weekday - 1]}
              </span>
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={hour.isOpen}
                  onChange={(event) => updateDay(hour.weekday, { isOpen: event.target.checked })}
                  className="size-4 accent-flambe-rust"
                />
              </label>
              <TimeSelect
                value={hour.openTime}
                disabled={!hour.isOpen}
                onChange={(value) => updateDay(hour.weekday, { openTime: value })}
              />
              <TimeSelect
                value={hour.closeTime}
                disabled={!hour.isOpen}
                onChange={(value) => updateDay(hour.weekday, { closeTime: value })}
              />
              <TimeSelect
                value={hour.lastBookingTime}
                disabled={!hour.isOpen}
                onChange={(value) => updateDay(hour.weekday, { lastBookingTime: value })}
              />
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-xs">
        <label className="flex items-start gap-2 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            checked={showClosedDays}
            onChange={(event) => setShowClosedDays(event.target.checked)}
            className="mt-0.5 size-4 accent-flambe-rust"
          />
          Hiển thị ngày nghỉ trong footer booking page
        </label>

        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-xs font-bold uppercase text-muted-foreground">Preview footer</p>
          <div className="mt-2 space-y-1 text-sm font-semibold text-foreground">
            {previewLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-flambe-rust px-3 text-sm font-bold text-white hover:bg-flambe-rust-hover disabled:opacity-60"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Lưu giờ hoạt động
        </button>
      </aside>
    </div>
  )
}

function TimeSelect({
  value,
  disabled,
  onChange,
}: {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-lg border border-input bg-background px-2 text-sm font-semibold outline-none focus-visible:border-ring disabled:opacity-45"
    >
      {TIME_OPTIONS.map((time) => (
        <option key={time} value={time}>{time}</option>
      ))}
    </select>
  )
}
