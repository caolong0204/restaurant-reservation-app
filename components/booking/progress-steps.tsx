'use client'

import { Check, CalendarIcon, Clock, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressStepsProps {
  step: number
  isPartySizeSelected: boolean
  isDateSelected: boolean
  isTimeSelected: boolean
  isInfoFilled: boolean
  handleStepClick: (targetStep: 1 | 2 | 3 | 4) => void
}

export function ProgressSteps({
  step,
  isPartySizeSelected,
  isDateSelected,
  isTimeSelected,
  isInfoFilled,
  handleStepClick,
}: ProgressStepsProps) {
  if (step === 5) return null

  return (
    <div className="grid grid-cols-4 gap-2 bg-secondary/35 p-2 sm:p-2.5 border-b border-border">
      {/* Step 1: Party Size */}
      <button
        type="button"
        onClick={() => handleStepClick(1)}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border bg-background py-1.5 sm:py-2 transition-all',
          step === 1
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border opacity-70 hover:opacity-100'
        )}
      >
        {isPartySizeSelected && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white p-0.5">
            <Check className="size-2.5 stroke-[3]" />
          </span>
        )}
        <Users className={cn('size-5', step === 1 ? 'text-primary' : 'text-muted-foreground')} />
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-foreground">Số khách</span>
      </button>

      {/* Step 2: Date */}
      <button
        type="button"
        onClick={() => handleStepClick(2)}
        disabled={!isPartySizeSelected}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border bg-background py-1.5 sm:py-2 transition-all',
          step === 2
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border opacity-70 hover:opacity-100',
          !isPartySizeSelected && 'cursor-not-allowed opacity-40'
        )}
      >
        {isDateSelected && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white p-0.5">
            <Check className="size-2.5 stroke-[3]" />
          </span>
        )}
        <CalendarIcon className={cn('size-5', step === 2 ? 'text-primary' : 'text-muted-foreground')} />
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-foreground">Chọn ngày</span>
      </button>

      {/* Step 3: Time */}
      <button
        type="button"
        onClick={() => handleStepClick(3)}
        disabled={!isDateSelected}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border bg-background py-1.5 sm:py-2 transition-all',
          step === 3
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border opacity-70 hover:opacity-100',
          !isDateSelected && 'cursor-not-allowed opacity-40'
        )}
      >
        {isTimeSelected && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white p-0.5">
            <Check className="size-2.5 stroke-[3]" />
          </span>
        )}
        <Clock className={cn('size-5', step === 3 ? 'text-primary' : 'text-muted-foreground')} />
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-foreground">Giờ đặt</span>
      </button>

      {/* Step 4: Info */}
      <button
        type="button"
        onClick={() => handleStepClick(4)}
        disabled={!isTimeSelected}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border bg-background py-1.5 sm:py-2 transition-all',
          step === 4
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border opacity-70 hover:opacity-100',
          !isTimeSelected && 'cursor-not-allowed opacity-40'
        )}
      >
        {isInfoFilled && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white p-0.5">
            <Check className="size-2.5 stroke-[3]" />
          </span>
        )}
        <User className={cn('size-5', step === 4 ? 'text-primary' : 'text-muted-foreground')} />
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-foreground">Thông tin</span>
      </button>
    </div>
  )
}
