'use client'

import { useState } from 'react'
import {
  CalendarIcon,
  Check,
  ChevronLeft,
  Clock,
  PartyPopper,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useReservations } from '@/components/reservation-provider'
import {
  OCCASIONS,
  PARTY_SIZES,
  TIME_SLOTS,
  formatDateLong,
  formatTime,
} from '@/lib/restaurant'
import { cn } from '@/lib/utils'

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function BookingForm() {
  const { addReservation } = useReservations()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [partySize, setPartySize] = useState<string>('2')
  const [time, setTime] = useState<string>('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [occasion, setOccasion] = useState(OCCASIONS[0])
  const [notes, setNotes] = useState('')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const step1Valid = Boolean(date && time && partySize)
  const step2Valid = name.trim() && email.trim() && phone.trim()

  function handleConfirm() {
    if (!date || !step2Valid) return
    addReservation({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date: toISO(date),
      time,
      partySize: Number(partySize),
      occasion: occasion === OCCASIONS[0] ? undefined : occasion,
      notes: notes.trim() || undefined,
    })
    toast.success('Reservation requested', {
      description: 'We will confirm your table by email shortly.',
    })
    setStep(3)
  }

  function reset() {
    setStep(1)
    setDate(undefined)
    setPartySize('2')
    setTime('')
    setName('')
    setEmail('')
    setPhone('')
    setOccasion(OCCASIONS[0])
    setNotes('')
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      {/* Progress header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-6 py-4">
        <div>
          <p className="font-serif text-lg font-semibold text-foreground">
            {step === 3 ? 'Reservation received' : 'Reserve a table'}
          </p>
          <p className="text-sm text-muted-foreground">
            {step === 1 && 'Choose your date, party, and time'}
            {step === 2 && 'Tell us who is joining'}
            {step === 3 && 'We look forward to hosting you'}
          </p>
        </div>
        {step !== 3 && (
          <span className="text-sm font-medium text-muted-foreground">
            Step {step} of 2
          </span>
        )}
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      'inline-flex h-9 items-center justify-start gap-2 rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-xs transition-colors hover:bg-secondary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      !date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="size-4" />
                    {date ? formatDateLong(toISO(date)) : 'Select a date'}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < today}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1.5">
                  <Users className="size-3.5" /> Party size
                </Label>
                <Select value={partySize} onValueChange={setPartySize}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTY_SIZES.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? 'guest' : 'guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="size-3.5" /> Time
              </Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={cn(
                      'rounded-md border px-2 py-2 text-sm font-medium transition-colors',
                      time === slot
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary',
                    )}
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="mt-1 w-full"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">
                {date && formatDateLong(toISO(date))}
              </span>
              <span className="text-muted-foreground">
                {' · '}
                {time && formatTime(time)} · {partySize}{' '}
                {Number(partySize) === 1 ? 'guest' : 'guests'}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(415) 555-0100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5">
                <PartyPopper className="size-3.5" /> Occasion
              </Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="w-full">
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Special requests</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Allergies, seating preferences, celebrations..."
                className="resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="gap-1"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="size-4" /> Back
              </Button>
              <Button
                size="lg"
                className="flex-1"
                disabled={!step2Valid}
                onClick={handleConfirm}
              >
                Confirm reservation
              </Button>
            </div>
          </div>
        )}

        {step === 3 && date && (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-7" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-serif text-2xl font-semibold text-foreground">
                Thank you, {name.split(' ')[0]}
              </p>
              <p className="max-w-sm text-pretty text-sm text-muted-foreground">
                Your request for a table is in. A confirmation will be sent to{' '}
                <span className="font-medium text-foreground">{email}</span>.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-lg border border-border bg-secondary/40 px-5 py-4 text-left text-sm">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">
                  {formatDateLong(toISO(date))}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">
                  {formatTime(time)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Party</span>
                <span className="font-medium text-foreground">
                  {partySize} {Number(partySize) === 1 ? 'guest' : 'guests'}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={reset}>
              Make another reservation
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
