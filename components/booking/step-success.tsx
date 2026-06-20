'use client'

import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  FileText,
  Layers,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime, TABLE_LOCATIONS, OCCASIONS } from '@/lib/restaurant'

interface StepSuccessProps {
  name: string
  phone: string
  email?: string
  date: Date | undefined
  time: string
  partySize: string
  occasion?: string
  tableLocation?: string
  notes?: string
  reset: () => void
}


function formatDDMMYYYY(date: Date) {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

export function StepSuccess({
  name,
  phone,
  email,
  date,
  time,
  partySize,
  occasion,
  tableLocation,
  notes,
  reset,
}: StepSuccessProps) {
  if (!date) return null

  return (
    <div className="flex flex-col items-center gap-3.5 py-3 sm:gap-5 sm:py-6 text-center animate-in fade-in zoom-in-95 duration-200">
      <span className="flex size-11 sm:size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="size-5 sm:size-7 stroke-[3]" />
      </span>
      <div className="flex flex-col gap-1 sm:gap-1.5">
        <h4 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Cảm ơn bạn, {name.split(' ')[0]}!
        </h4>
        <p className="max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Yêu cầu đặt bàn của bạn đã được ghi nhận thành công. Nhà hàng sẽ liên hệ{' '}
          <span className="font-semibold text-foreground">{phone}</span> để xác nhận.
        </p>
      </div>

      {/* Ticket Card */}
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 sm:p-6 text-left text-sm shadow-md relative overflow-hidden mt-1.5 sm:mt-2">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />

        <div className="flex flex-col gap-4 sm:gap-5">
          <h4 className="font-serif text-base sm:text-lg font-bold text-foreground border-b border-border/60 pb-2 sm:pb-3 text-center">
            Chi tiết đặt bàn
          </h4>

          {/* Selections */}
          <div className="flex flex-col gap-2.5 sm:gap-3.5">
            {/* Party size */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Users className="size-4 text-primary" />
                Số lượng khách
              </span>
              <span className="font-semibold text-foreground">
                {partySize} khách
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Calendar className="size-4 text-primary" />
                Ngày dùng bữa
              </span>
              <span className="font-semibold text-foreground">
                {formatDDMMYYYY(date)}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Clock className="size-4 text-primary" />
                Giờ đón khách
              </span>
              <span className="font-semibold text-foreground">
                {formatTime(time)}
              </span>
            </div>
          </div>

          {/* Guest Details */}
          <div className="border-t border-dashed border-border/80 pt-3 sm:pt-4 flex flex-col gap-2.5 sm:gap-3.5">
            <h5 className="font-serif text-sm font-bold text-foreground opacity-90">
              Thông tin liên hệ
            </h5>

            <div className="flex flex-col gap-2 sm:gap-2.5">
              {/* Name */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="size-3.5" />
                  Họ và tên
                </span>
                <span className="font-medium text-foreground">{name}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="size-3.5" />
                  Số điện thoại
                </span>
                <span className="font-medium text-foreground">{phone}</span>
              </div>

              {/* Email */}
              {email && (
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="size-3.5" />
                    Email
                  </span>
                  <span className="font-medium text-foreground">{email}</span>
                </div>
              )}


              {/* Occasion */}
              {occasion && occasion !== OCCASIONS[0] && (
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle className="size-3.5" />
                    Dịp đặc biệt
                  </span>
                  <span className="font-medium text-foreground">{occasion}</span>
                </div>
              )}

              {/* Table Location */}
              {tableLocation && tableLocation !== TABLE_LOCATIONS[0] && (
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Layers className="size-3.5" />
                    Vị trí bàn
                  </span>
                  <span className="font-medium text-foreground">{tableLocation}</span>
                </div>
              )}

              {/* Special requests */}
              {notes && notes.trim() && (
                <div className="flex flex-col gap-1.5 text-xs mt-1 bg-secondary/35 rounded-lg p-2.5 border border-border/40">
                  <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <FileText className="size-3.5" />
                    Yêu cầu đặc biệt
                  </span>
                  <p className="italic text-muted-foreground/90 leading-relaxed font-serif text-[13px]">
                    “{notes}”
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={reset}
        className="mt-1.5 sm:mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md px-6 py-2 animate-bounce"
      >
        Đặt bàn khác
      </Button>
    </div>
  )
}
