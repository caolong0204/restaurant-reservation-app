'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OCCASIONS } from '@/lib/restaurant'
import { cn, validateVNPhone } from '@/lib/utils'
import {
  AlertCircle,
  MessageSquare,
  PartyPopper,
  Phone,
  User,
  Mail,
} from 'lucide-react'

interface StepInfoProps {
  name: string
  setName: (val: string) => void
  email: string
  setEmail: (val: string) => void
  phone: string
  setPhone: (val: string) => void

  occasion: string
  setOccasion: (val: string) => void
  notes: string
  setNotes: (val: string) => void
  availableCount?: number
}

export function StepInfo({
  name,
  setName,
  email = '',
  setEmail,
  phone,
  setPhone,

  occasion,
  setOccasion,
  notes,
  setNotes,
  availableCount = 10,
}: StepInfoProps) {
  const isPhoneInvalid = phone.trim().length > 0 && !validateVNPhone(phone)
  const isEmailInvalid = email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isWaitlist = availableCount === 0
  const isScarcity = availableCount > 0 && availableCount < 2

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {isWaitlist && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
          <div className="text-[13px] leading-relaxed">
            <strong className="block text-sm font-bold mb-0.5">Đã hết bàn!</strong>
            Khung giờ này vừa mới kín chỗ. Vui lòng quay lại bước trước để chọn một khung giờ khác.
          </div>
        </div>
      )}

      {isScarcity && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-800 flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
          <div className="text-[13px] leading-relaxed">
            <strong className="block text-sm font-bold mb-0.5">Sắp hết bàn!</strong>
            Chỉ còn lại rất ít bàn trống trong khung giờ này. Vui lòng hoàn tất nhanh để hệ thống ghi nhận.
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pb-2 sm:pb-3">
        <User className="size-4 sm:size-5 text-flambe-rust" />
        <div>
          <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
            Thông tin đặt bàn & Yêu cầu
          </h4>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Cung cấp thông tin liên lạc và các nhu cầu bổ sung của bạn
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="flex items-center gap-1">
            <User className="size-3 text-muted-foreground" />
            <span>Họ và tên <span className="text-red-500">*</span></span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên người đặt bàn"
            className="rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone" className="flex items-center gap-1">
            <Phone className={cn("size-3 text-muted-foreground", isPhoneInvalid && "text-destructive")} />
            <span>Số điện thoại <span className="text-red-500">*</span></span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="ví dụ: 090 123 4567"
            className="rounded-lg"
            aria-invalid={isPhoneInvalid || undefined}
          />
          {isPhoneInvalid && (
            <span className="text-xs text-destructive font-medium mt-0.5">
              Số điện thoại không hợp lệ (ví dụ: 0901234567)
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="flex items-center gap-1">
          <Mail className={cn("size-3 text-muted-foreground", isEmailInvalid && "text-destructive")} />
          <span>Email</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ví dụ: khach@email.com"
          className="rounded-lg"
          aria-invalid={isEmailInvalid || undefined}
        />
        {isEmailInvalid && (
          <span className="text-xs text-destructive font-medium mt-0.5">
            Email không hợp lệ (ví dụ: khach@email.com)
          </span>
        )}
      </div>



      <div className="flex flex-col gap-1.5">
        <Label className="flex items-center gap-1.5">
          <PartyPopper className="size-3 text-muted-foreground" /> Dịp đặc biệt
        </Label>
        <Select value={occasion} onValueChange={(val) => setOccasion(val ?? '')}>
          <SelectTrigger className="w-full rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OCCASIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes" className="flex items-center gap-1.5">
          <MessageSquare className="size-3 text-muted-foreground" /> Yêu cầu đặc biệt
        </Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Dị ứng thực phẩm, chuẩn bị bánh kem chúc mừng..."
          className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-[17px] md:text-[15px] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-all placeholder:text-muted-foreground/50"
        />
      </div>


    </div>
  )
}
