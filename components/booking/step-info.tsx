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
import { useLocale } from '@/lib/i18n/locale-context'
import { translateOccasion } from '@/lib/i18n/locale-utils'
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
  const { t } = useLocale()
  // Translated labels for occasions — stored value stays as OCCASIONS[index] (Vietnamese key)
  const occasionLabels = t('occasions') as unknown as string[]

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
            <strong className="block text-sm font-bold mb-0.5">{t('guestInfo.fullyBookedTitle')}</strong>
            {t('guestInfo.fullyBookedBody')}
          </div>
        </div>
      )}

      {isScarcity && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-800 flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
          <div className="text-[13px] leading-relaxed">
            <strong className="block text-sm font-bold mb-0.5">{t('guestInfo.scarcityTitle')}</strong>
            {t('guestInfo.scarcityBody')}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pb-2 sm:pb-3">
        <User className="size-4 sm:size-5 text-flambe-rust" />
        <div>
          <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
            {t('guestInfo.sectionTitle')}
          </h4>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            {t('guestInfo.sectionSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="flex items-center gap-1">
            <User className="size-3 text-muted-foreground" />
            <span>{t('guestInfo.nameLabel')} <span className="text-red-500">*</span></span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('guestInfo.namePlaceholder')}
            className="rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone" className="flex items-center gap-1">
            <Phone className={cn("size-3 text-muted-foreground", isPhoneInvalid && "text-destructive")} />
            <span>{t('guestInfo.phoneLabel')} <span className="text-red-500">*</span></span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('guestInfo.phonePlaceholder')}
            className="rounded-lg"
            aria-invalid={isPhoneInvalid || undefined}
          />
          {isPhoneInvalid && (
            <span className="text-xs text-destructive font-medium mt-0.5">
              {t('guestInfo.phoneError')}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="flex items-center gap-1">
          <Mail className={cn("size-3 text-muted-foreground", isEmailInvalid && "text-destructive")} />
          <span>{t('guestInfo.emailLabel')}</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('guestInfo.emailPlaceholder')}
          className="rounded-lg"
          aria-invalid={isEmailInvalid || undefined}
        />
        {isEmailInvalid && (
          <span className="text-xs text-destructive font-medium mt-0.5">
            {t('guestInfo.emailError')}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="flex items-center gap-1.5">
          <PartyPopper className="size-3 text-muted-foreground" /> {t('guestInfo.occasionLabel')}
        </Label>
        {/*
         * Internal value uses OCCASIONS (Vietnamese) as the stable key stored in DB.
         * Display label is looked up by index from the translated occasionLabels array.
         */}
        <Select value={occasion} onValueChange={(val) => setOccasion(val ?? '')}>
          <SelectTrigger className="w-full rounded-lg">
            <SelectValue>
              {translateOccasion(occasion, occasionLabels)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {OCCASIONS.map((o, idx) => (
              <SelectItem key={o} value={o}>
                {occasionLabels[idx] ?? o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes" className="flex items-center gap-1.5">
          <MessageSquare className="size-3 text-muted-foreground" /> {t('guestInfo.notesLabel')}
        </Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder={t('guestInfo.notesPlaceholder')}
          className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-[17px] md:text-[15px] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-all placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  )
}
