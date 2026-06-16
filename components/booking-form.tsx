'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useReservations } from '@/components/reservation-provider'
import { OCCASIONS, TABLE_LOCATIONS } from '@/lib/restaurant'
import { getPublicSlotAvailability } from '@/lib/reservation-actions'
import type { SlotAvailability } from '@/lib/reservation-types'
import { cn, validateVNPhone, validateEmail } from '@/lib/utils'

// Import split sub-components
import { ProgressSteps } from './booking/progress-steps'
import { StepPartySize } from './booking/step-party-size'
import { StepDate } from './booking/step-date'
import { StepTime } from './booking/step-time'
import { StepInfo } from './booking/step-info'
import { StepSuccess } from './booking/step-success'
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
  const { addReservation } = useReservations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Validation rules for each step
  const isStep1Valid = isCustomParty
    ? (Number(customPartyValue) >= 9 && Number(customPartyValue) <= 24 && !isNaN(Number(customPartyValue)))
    : Boolean(partySize)
  const isStep2Valid = Boolean(date)
  const isStep3Valid = Boolean(time)
  const isStep4Valid = Boolean(name.trim() && phone.trim() && validateVNPhone(phone))

  useEffect(() => {
    if (step !== 3 || !date || !isStep1Valid) return

    let isActive = true
    setIsLoadingSlots(true)
    setSlotError(null)

    getPublicSlotAvailability(toISO(date), Number(partySize))
      .then((result) => {
        if (!isActive) return

        if (result.ok) {
          setSlotAvailability(result.data)
          // Clear selected time only if it has become fully booked
          setTime((prev) => {
            const selectedSlot = result.data.find((slot) => slot.time === prev)
            return selectedSlot?.availableCount === 0 ? '' : prev
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

    return () => {
      isActive = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, isStep1Valid, partySize, step])

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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all duration-300">
      {/* Header with App Theme Color */}
      <div className="flex items-center justify-between bg-primary px-6 py-5 text-primary-foreground">
        <h3 className="font-serif text-xl font-bold tracking-tight">Đặt bàn</h3>
        {step !== 5 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold tracking-wider opacity-90">
              {step}/4
            </span>
            <div className="h-1.5 w-20 sm:w-28 rounded-full bg-primary-foreground/25 overflow-hidden">
              <div
                className="h-full bg-primary-foreground transition-all duration-300 ease-out"
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
      <div className="p-4 pt-3 sm:p-6">
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
            phone={phone}
            setPhone={setPhone}

            occasion={occasion}
            setOccasion={setOccasion}
            tableLocation={tableLocation}
            setTableLocation={setTableLocation}
            notes={notes}
            setNotes={setNotes}
          />
        )}

        {step === 5 && (
          <StepSuccess
            name={name}
            phone={phone}

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
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
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
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]'
                )}
              >
                <span>Tiếp tục</span>
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
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]'
                )}
              >
                <span>{isSubmitting ? 'Đang gửi...' : 'Xác nhận đặt bàn'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
