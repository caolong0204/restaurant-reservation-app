import * as React from 'react'
import { useState } from 'react'
import { Check, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TIME_SLOTS, OCCASIONS, TABLE_LOCATIONS } from '@/lib/restaurant'
import { validateVNPhone, validateEmail } from '@/lib/utils'

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    email: string
    phone: string
    date: string
    time: string
    partySize: number
    occasion?: string
    tableLocation?: string
    notes?: string
  }) => void
}

export function CreateModal({ isOpen, onClose, onSubmit }: CreateModalProps) {
  const [cName, setCName] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cDate, setCDate] = useState('')
  const [cTime, setCTime] = useState(TIME_SLOTS[7]) // default to 17:00
  const [cPartySize, setCPartySize] = useState('4')
  const [cOccasion, setCOccasion] = useState(OCCASIONS[0])
  const [cTableLocation, setCTableLocation] = useState(TABLE_LOCATIONS[0])
  const [cNotes, setCNotes] = useState('')

  if (!isOpen) return null

  // Form validations
  const isCPirtyValid = Number(cPartySize) > 0 && !isNaN(Number(cPartySize))
  const isCPhoneValid = cPhone.trim() === '' || validateVNPhone(cPhone)
  const isCEmailValid = cEmail.trim() === '' || validateEmail(cEmail)
  const isCreateValid = Boolean(
    cName.trim() &&
    cEmail.trim() &&
    validateEmail(cEmail) &&
    cPhone.trim() &&
    validateVNPhone(cPhone) &&
    cDate &&
    cTime &&
    isCPirtyValid
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isCreateValid) return

    onSubmit({
      name: cName.trim(),
      email: cEmail.trim(),
      phone: cPhone.trim(),
      date: cDate,
      time: cTime,
      partySize: Number(cPartySize),
      occasion: cOccasion === OCCASIONS[0] ? undefined : cOccasion,
      tableLocation: cTableLocation === TABLE_LOCATIONS[0] ? undefined : cTableLocation,
      notes: cNotes.trim() || undefined,
    })

    // Reset fields
    setCName('')
    setCPhone('')
    setCEmail('')
    setCDate('')
    setCTime(TIME_SLOTS[7])
    setCPartySize('4')
    setCOccasion(OCCASIONS[0])
    setCTableLocation(TABLE_LOCATIONS[0])
    setCNotes('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl relative overflow-hidden animate-in scale-in duration-200">
        {/* Top brand line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Thêm Đặt Bàn Thủ Công</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="cName" className="text-xs font-semibold">Tên khách hàng</Label>
              <Input id="cName" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Tên khách" required className="rounded-lg h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cPhone" className="text-xs font-semibold">Số điện thoại</Label>
              <Input id="cPhone" type="tel" value={cPhone} onChange={(e) => setCPhone(e.target.value)} placeholder="ví dụ: 090 123 4567" required className="rounded-lg h-9 text-sm" aria-invalid={!isCPhoneValid || undefined} />
              {!isCPhoneValid && (
                <span className="text-[10px] text-destructive font-medium">SĐT không hợp lệ (VN format)</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="cEmail" className="text-xs font-semibold">Email</Label>
            <Input id="cEmail" type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="khachhang@example.com" required className="rounded-lg h-9 text-sm" aria-invalid={!isCEmailValid || undefined} />
            {!isCEmailValid && (
              <span className="text-[10px] text-destructive font-medium">Email không hợp lệ</span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="cDate" className="text-xs font-semibold">Ngày dùng bữa</Label>
              <Input id="cDate" type="date" value={cDate} onChange={(e) => setCDate(e.target.value)} required className="rounded-lg h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cTime" className="text-xs font-semibold">Giờ đón khách</Label>
              <select id="cTime" value={cTime} onChange={(e) => setCTime(e.target.value)} required className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cPartySize" className="text-xs font-semibold">Số lượng khách</Label>
              <Input id="cPartySize" type="number" min="1" value={cPartySize} onChange={(e) => setCPartySize(e.target.value)} required className="rounded-lg h-9 text-sm" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="cOccasion" className="text-xs font-semibold">Dịp đặc biệt</Label>
              <select id="cOccasion" value={cOccasion} onChange={(e) => setCOccasion(e.target.value)} className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full">
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cTableLocation" className="text-xs font-semibold">Vị trí bàn</Label>
              <select id="cTableLocation" value={cTableLocation} onChange={(e) => setCTableLocation(e.target.value)} className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full">
                {TABLE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="cNotes" className="text-xs font-semibold">Ghi chú yêu cầu</Label>
            <textarea id="cNotes" value={cNotes} onChange={(e) => setCNotes(e.target.value)} rows={2} placeholder="Yêu cầu đặc biệt nếu có..." className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/50" />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-3 mt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 rounded-lg text-xs">Hủy bỏ</Button>
            <Button type="submit" size="sm" disabled={!isCreateValid} className="h-9 rounded-lg text-xs gap-1">
              <Check className="size-3.5" />
              Xác nhận đặt bàn
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
