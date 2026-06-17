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
  Info,
  MessageSquare,
  PartyPopper,
  Phone,
  User,
} from 'lucide-react'

interface StepInfoProps {
  name: string
  setName: (val: string) => void
  phone: string
  setPhone: (val: string) => void

  occasion: string
  setOccasion: (val: string) => void
  notes: string
  setNotes: (val: string) => void
}

export function StepInfo({
  name,
  setName,
  phone,
  setPhone,

  occasion,
  setOccasion,
  notes,
  setNotes,
}: StepInfoProps) {
  const isPhoneInvalid = phone.trim().length > 0 && !validateVNPhone(phone)


  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex items-center gap-2 pb-1.5 sm:pb-2 border-b border-border">
        <User className="size-4 sm:size-5 text-primary" />
        <div>
          <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
            Thông tin đặt bàn & Yêu cầu
          </h4>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Cung cấp thông tin liên lạc và các nhu cầu bổ sung của bạn
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="flex items-center gap-1">
            <User className="size-3 text-muted-foreground" /> Họ và tên
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
            <Phone className={cn("size-3 text-muted-foreground", isPhoneInvalid && "text-destructive")} /> Số điện thoại
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
          rows={3}
          placeholder="Dị ứng thực phẩm, sở thích chỗ ngồi, chuẩn bị bánh kem chúc mừng..."
          className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-[17px] md:text-[15px] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="flex flex-col gap-1.5 justify-center rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-primary font-medium mt-1">
        <div className="flex gap-2">
          <Info className="size-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Vui lòng nhận bàn theo sự sắp xếp và tình trạng có sẵn tại thực tế.
          </p>
        </div>
      </div>
    </div>
  )
}
