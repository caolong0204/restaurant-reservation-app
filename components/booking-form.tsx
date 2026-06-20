'use client'

import { useReservationDispatch } from '@/components/reservation-provider'
import { getPublicSlotAvailability } from '@/lib/reservation-actions'
import type { SlotAvailability } from '@/lib/reservation-types'
import { OCCASIONS, TABLE_LOCATIONS, isPastTimeSlot } from '@/lib/restaurant'
import { cn, validateVNPhone } from '@/lib/utils'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// Import split sub-components
import { ProgressSteps } from './booking/progress-steps'
import { StepDate } from './booking/step-date'
import { StepInfo } from './booking/step-info'
import { StepPartySize } from './booking/step-party-size'
import { StepSuccess } from './booking/step-success'
import { StepTime } from './booking/step-time'
import { SummaryBar } from './booking/summary-bar'

function toISO(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface BookingFormProps {
  step: 1 | 2 | 3 | 4 | 5
  setStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4 | 5>>
  date: Date | undefined
  setDate: (d: Date | undefined) => void
  partySize: string
  setPartySize: (size: string) => void
  time: string
  setTime: React.Dispatch<React.SetStateAction<string>>
  name: string
  setName: (val: string) => void
  email: string
  setEmail: (val: string) => void
  phone: string
  setPhone: (val: string) => void
  occasion: string
  setOccasion: (val: string) => void
  tableLocation: string
  setTableLocation: (val: string) => void
  notes: string
  setNotes: (val: string) => void
  isCustomParty: boolean
  setIsCustomParty: (isCustom: boolean) => void
  customPartyValue: string
  setCustomPartyValue: (val: string) => void
  currentMonth: Date
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>
}

export function BookingForm({
  step,
  setStep,
  date,
  setDate,
  partySize,
  setPartySize,
  time,
  setTime,
  name,
  setName,
  email = '',
  setEmail,
  phone,
  setPhone,
  occasion,
  setOccasion,
  tableLocation,
  setTableLocation,
  notes,
  setNotes,
  isCustomParty,
  setIsCustomParty,
  customPartyValue,
  setCustomPartyValue,
  currentMonth,
  setCurrentMonth,
}: BookingFormProps) {
  const { addReservation } = useReservationDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)

  type SlotCache = {
    date: string
    partySize: number
    data: SlotAvailability[]
    fetchedAt: number
  }
  const slotCache = useRef<SlotCache | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Validation rules for each step
  const isStep1Valid = isCustomParty
    ? (Number(customPartyValue) >= 9 && Number(customPartyValue) <= 24 && !isNaN(Number(customPartyValue)))
    : Boolean(partySize)
  const isStep2Valid = Boolean(date)
  const selectedSlotCount = slotAvailability.find((s) => s.time === time)?.availableCount ?? 0
  const isStep3Valid = Boolean(time && selectedSlotCount > 0)

  // Step 4 is valid if name, phone, optional email are valid, and table is available
  const isStep4Valid = Boolean(
    name.trim() &&
      validateVNPhone(phone) &&
      (!email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) &&
      selectedSlotCount > 0,
  )

  useEffect(() => {
    if (!date || !isStep1Valid) return

    let isActive = true
    const dateStr = toISO(date)
    const size = Number(partySize)

    // Check if we have valid cache < 3 mins old
    const now = Date.now()
    const cache = slotCache.current
    if (cache && cache.date === dateStr && cache.partySize === size) {
      if (now - cache.fetchedAt < 3 * 60 * 1000) {
        setSlotAvailability(cache.data)
        
        // Also ensure selected time is cleared if it's no longer selectable
        setTime((prev) => {
          if (!prev) return prev
          if (isPastTimeSlot(prev, dateStr)) return ''
          return prev
        })
        return
      }
    }

    setIsLoadingSlots(true)
    setSlotError(null)

    // Debounce API call by 300ms
    const timeoutId = setTimeout(() => {
      getPublicSlotAvailability(dateStr, size)
        .then((result) => {
          if (!isActive) return

          if (result.ok) {
            slotCache.current = {
              date: dateStr,
              partySize: size,
              data: result.data,
              fetchedAt: Date.now(),
            }
            setSlotAvailability(result.data)
            
            setTime((prev) => {
              if (!prev) return prev
              if (isPastTimeSlot(prev, dateStr)) return ''
              return prev
            })
          } else {
            setSlotError(result.error)
          }
        })
        .catch(() => {
          if (isActive) setSlotError('Không kiểm tra được tình trạng bàn trống.')
        })
        .finally(() => {
          if (isActive) setIsLoadingSlots(false)
        })
    }, 300)

    return () => {
      isActive = false
      clearTimeout(timeoutId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, isStep1Valid, partySize])

  // Step 3 Transition Revalidation
  useEffect(() => {
    if (step === 3 && date && isStep1Valid) {
      const cache = slotCache.current
      if (cache && (Date.now() - cache.fetchedAt >= 3 * 60 * 1000)) {
        // Cache is stale. We need to re-fetch slots.
        setIsLoadingSlots(true)
        const dateStr = toISO(date)
        const size = Number(partySize)
        
        getPublicSlotAvailability(dateStr, size)
          .then((result) => {
            if (result.ok) {
              slotCache.current = {
                date: dateStr,
                partySize: size,
                data: result.data,
                fetchedAt: Date.now(),
              }
              setSlotAvailability(result.data)
            }
          })
          .finally(() => {
            setIsLoadingSlots(false)
          })
      }
    }
  }, [step, date, isStep1Valid, partySize])

  // Maximum step the user is allowed to navigate to
  const getMaxAllowedStep = () => {
    if (!isStep1Valid) return 1
    if (!isStep2Valid) return 2
    if (!isStep3Valid) return 3
    if (!isStep4Valid) return 4
    return 4
  }

  const handleStepClick = (targetStep: 1 | 2 | 3 | 4) => {
    if (step === 5) return
    const maxAllowed = getMaxAllowedStep()
    if (targetStep <= maxAllowed || targetStep <= step) {
      setStep(targetStep)
    }
  }

  async function handleConfirm() {
    if (!date || !isStep4Valid || isSubmitting) return
    setIsSubmitting(true)

    const result = await addReservation({
      name: name.trim(),
      email: email?.trim() || undefined,
      phone: phone.trim(),
      date: toISO(date),
      time,
      partySize: Number(partySize),
      occasion: occasion === OCCASIONS[0] ? undefined : occasion,
      tableLocation: tableLocation === TABLE_LOCATIONS[0] ? undefined : tableLocation,
      notes: notes.trim() || undefined,
    })

    setIsSubmitting(false)

    if (result.ok) {
      toast.success('Đã gửi yêu cầu đặt bàn', {
        description: 'Nhà hàng sẽ kiểm tra và liên hệ để xác nhận bàn của bạn.',
      })
      setStep(5)
      return
    }

    toast.error('Chưa gửi được yêu cầu đặt bàn', {
      description: result.error,
    })
  }

  function reset() {
    setStep(1)
    setDate(undefined)
    setPartySize('4')
    setTime('')
    setName('')

    setPhone('')
    setOccasion(OCCASIONS[0])
    setTableLocation(TABLE_LOCATIONS[0])
    setNotes('')
    setCurrentMonth(() => {
      const initial = new Date()
      initial.setDate(1)
      return initial
    })
    setIsCustomParty(false)
    setCustomPartyValue('9')
    setSlotAvailability([])
    setSlotError(null)
  }

  return (
    <div className="rounded-xl bg-card shadow-lg transition-all duration-300">
      {/* Header with App Theme Color */}
      <div className="flex items-center justify-between rounded-t-xl bg-flambe-rust px-4 py-3 text-white">
        <h3 className="font-serif text-lg font-medium tracking-wide">Đặt bàn tại Flambé</h3>
        {step !== 5 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold tracking-wider opacity-90">
              {step}/4
            </span>
            <div className="h-1.5 w-20 sm:w-28 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300 ease-out"
                style={{ width: `${step * 25}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4-Step Card Progress Indicator */}
      <ProgressSteps
        step={step}
        isPartySizeSelected={isStep1Valid}
        isDateSelected={isStep2Valid}
        isTimeSelected={isStep3Valid}
        isInfoFilled={isStep4Valid}
        handleStepClick={handleStepClick}
      />

      {/* Main Step Content Container */}
      <div className="p-3 sm:p-3.5">
        {/* Step rendering orchestrator */}
        {step === 1 && (
          <StepPartySize
            partySize={partySize}
            setPartySize={setPartySize}
            isCustomParty={isCustomParty}
            setIsCustomParty={setIsCustomParty}
            customPartyValue={customPartyValue}
            setCustomPartyValue={setCustomPartyValue}
          />
        )}

        {step === 2 && (
          <StepDate
            date={date}
            setDate={setDate}
            today={today}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        )}

        {step === 3 && (
          <StepTime
            time={time}
            setTime={setTime}
            availability={slotAvailability}
            isLoading={isLoadingSlots}
            error={slotError}
            partySize={Number(partySize)}
            date={date ? toISO(date) : ''}
          />
        )}

        {step === 4 && (
          <StepInfo
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            occasion={occasion}
            setOccasion={setOccasion}
            notes={notes}
            setNotes={setNotes}
            availableCount={selectedSlotCount}
          />
        )}

        {step === 5 && (
          <StepSuccess
            name={name}
            phone={phone}
            email={email || undefined}
            date={date}
            time={time}
            partySize={partySize}
            occasion={occasion}
            tableLocation={tableLocation}
            notes={notes}
            reset={reset}
          />
        )}

        {/* Persistent Summary Bar aligned with Web Theme */}
        {step !== 5 && (
          <SummaryBar
            partySize={partySize}
            date={date}
            time={time}
          />
        )}

        {/* Navigation Buttons (Footer) */}
        {step !== 5 && (
          <div className="mt-3 border-t border-border pt-3">
            {step === 4 && (
              <p className="text-[11px] sm:text-xs text-rose-600 font-semibold text-left mb-3 select-none leading-relaxed">
                *Nhà hàng không nhận đặt vị trí bàn cụ thể, bàn sẽ được xếp theo tình hình thực tế tại thời điểm khách hàng tới dùng bữa.
              </p>
            )}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (step > 1) {
                    setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
                  }
                }}
                disabled={step === 1}
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold transition-colors',
                  step === 1 ? 'opacity-40 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ChevronLeft className="size-4" />
                <span>Quay lại</span>
              </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  const maxAllowed = getMaxAllowedStep()
                  if (step < maxAllowed) {
                    setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)
                  }
                }}
                disabled={
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  (step === 3 && !isStep3Valid)
                }
                className={cn(
                  'flex items-center gap-1 rounded-lg px-6 py-2 text-sm font-semibold transition-all shadow-md',
                  ((step === 1 && !isStep1Valid) ||
                    (step === 2 && !isStep2Valid) ||
                    (step === 3 && !isStep3Valid))
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                    : 'bg-flambe-rust hover:bg-flambe-rust-hover text-white active:scale-[0.98]'
                )}
              >
                <span>Tiếp tục</span>
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isStep4Valid || isSubmitting}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-6 py-2 text-sm font-semibold transition-all shadow-md',
                  !isStep4Valid || isSubmitting
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                    : 'bg-flambe-rust hover:bg-flambe-rust-hover text-white active:scale-[0.98]'
                )}
              >
                <span>{isSubmitting ? 'Đang gửi...' : 'Xác nhận đặt bàn'}</span>
              </button>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
