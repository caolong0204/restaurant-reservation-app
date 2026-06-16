import * as React from 'react'
import { useState, useEffect } from 'react'
import { Check, Edit3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Reservation } from '@/components/reservation-provider'
import type { ReservationInput } from '@/lib/reservation-types'
import { TIME_SLOTS, OCCASIONS, TABLE_LOCATIONS } from '@/lib/restaurant'
import { validateVNPhone, validateEmail } from '@/lib/utils'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation | null
  onSubmit: (id: string, data: ReservationInput) => void
}

export function EditModal({ isOpen, onClose, reservation, onSubmit }: EditModalProps) {
  const [eName, setEName] = useState('')
  const [ePhone, setEPhone] = useState('')
  const [eEmail, setEEmail] = useState('')
  const [eDate, setEDate] = useState('')
  const [eTime, setETime] = useState('')
  const [ePartySize, setEPartySize] = useState('')
  const [eOccasion, setEOccasion] = useState('')
  const [eTableLocation, setETableLocation] = useState('')
  const [eNotes, setENotes] = useState('')

  useEffect(() => {
    if (reservation) {
      setEName(reservation.name)
      setEPhone(reservation.phone)
      setEEmail(reservation.email)
      setEDate(reservation.date)
      setETime(reservation.time)
      setEPartySize(String(reservation.partySize))
      setEOccasion(reservation.occasion || OCCASIONS[0])
      setETableLocation(reservation.tableLocation || TABLE_LOCATIONS[0])
      setENotes(reservation.notes || '')
    }
  }, [reservation])

  if (!isOpen || !reservation) return null

  // Form validations
  const isEPartyValid = Number(ePartySize) > 0 && Number(ePartySize) <= 24 && !isNaN(Number(ePartySize))
  const isEPhoneValid = ePhone.trim() === '' || validateVNPhone(ePhone)
  const isEEmailValid = eEmail.trim() === '' || validateEmail(eEmail)
  const isEditValid = Boolean(
    eName.trim() &&
    eEmail.trim() &&
    validateEmail(eEmail) &&
    ePhone.trim() &&
    validateVNPhone(ePhone) &&
    eDate &&
    eTime &&
    isEPartyValid
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEditValid || !reservation) return

    onSubmit(reservation.id, {
      name: eName.trim(),
      email: eEmail.trim(),
      phone: ePhone.trim(),
      date: eDate,
      time: eTime,
      partySize: Number(ePartySize),
      occasion: eOccasion === OCCASIONS[0] ? undefined : eOccasion,
      tableLocation: eTableLocation === TABLE_LOCATIONS[0] ? undefined : eTableLocation,
      notes: eNotes.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl relative overflow-hidden animate-in scale-in duration-200">
        {/* Top brand line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5">
            <Edit3 className="size-4 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Sửa Thông Tin Đặt Bàn</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="eName" className="text-xs font-semibold">Tên khách hàng</Label>
              <Input id="eName" value={eName} onChange={(e) => setEName(e.target.value)} required className="rounded-lg h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ePhone" className="text-xs font-semibold">Số điện thoại</Label>
              <Input id="ePhone" type="tel" value={ePhone} onChange={(e) => setEPhone(e.target.value)} required className="rounded-lg h-9 text-sm" aria-invalid={!isEPhoneValid || undefined} />
              {!isEPhoneValid && (
                <span className="text-[10px] text-destructive font-medium">SĐT không hợp lệ (VN format)</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="eEmail" className="text-xs font-semibold">Email</Label>
            <Input id="eEmail" type="email" value={eEmail} onChange={(e) => setEEmail(e.target.value)} required className="rounded-lg h-9 text-sm" aria-invalid={!isEEmailValid || undefined} />
            {!isEEmailValid && (
              <span className="text-[10px] text-destructive font-medium">Email không hợp lệ</span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="eDate" className="text-xs font-semibold">Ngày dùng bữa</Label>
              <Input id="eDate" type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} required className="rounded-lg h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="eTime" className="text-xs font-semibold">Giờ đón khách</Label>
              <select id="eTime" value={eTime} onChange={(e) => setETime(e.target.value)} required className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ePartySize" className="text-xs font-semibold">Số lượng khách</Label>
              <Input id="ePartySize" type="number" min="1" max="24" value={ePartySize} onChange={(e) => setEPartySize(e.target.value)} required className="rounded-lg h-9 text-sm" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="eOccasion" className="text-xs font-semibold">Dịp đặc biệt</Label>
              <select id="eOccasion" value={eOccasion} onChange={(e) => setEOccasion(e.target.value)} className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full">
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="eTableLocation" className="text-xs font-semibold">Vị trí bàn</Label>
              <select id="eTableLocation" value={eTableLocation} onChange={(e) => setETableLocation(e.target.value)} className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full">
                {TABLE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="eNotes" className="text-xs font-semibold">Ghi chú yêu cầu</Label>
            <textarea id="eNotes" value={eNotes} onChange={(e) => setENotes(e.target.value)} rows={2} className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/50" />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-3 mt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 rounded-lg text-xs">Hủy bỏ</Button>
            <Button type="submit" size="sm" disabled={!isEditValid} className="h-9 rounded-lg text-xs gap-1">
              <Check className="size-3.5" />
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
