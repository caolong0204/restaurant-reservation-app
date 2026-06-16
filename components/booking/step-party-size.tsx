'use client'

import { Users } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PARTY_SIZES } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

interface StepPartySizeProps {
  partySize: string
  setPartySize: (size: string) => void
  isCustomParty: boolean
  setIsCustomParty: (isCustom: boolean) => void
  customPartyValue: string
  setCustomPartyValue: (val: string) => void
}

export function StepPartySize({
  partySize,
  setPartySize,
  isCustomParty,
  setIsCustomParty,
  customPartyValue,
  setCustomPartyValue,
}: StepPartySizeProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-2 sm:gap-6 sm:py-4 text-center">
      <div className="flex flex-col items-center">
        <Users className="size-6 text-primary mb-1.5 sm:size-8 sm:mb-2" />
        <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground">
          Số lượng khách là bao nhiêu?
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Vui lòng chọn số lượng người tham gia dùng bữa cùng bạn
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-1 sm:mt-2">
        {PARTY_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => {
              setPartySize(String(size))
              setIsCustomParty(false)
            }}
            className={cn(
              'flex h-12 items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-200',
              !isCustomParty && partySize === String(size)
                ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/10'
                : 'border-border bg-background hover:border-primary/50 hover:bg-secondary/40'
            )}
          >
            {size}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setIsCustomParty(true)
            setPartySize(customPartyValue)
          }}
          className={cn(
            'flex h-12 items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-200',
            isCustomParty
              ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/10'
              : 'border-border bg-background hover:border-primary/50 hover:bg-secondary/40'
          )}
        >
          Khác...
        </button>
      </div>

      {isCustomParty && (
        <div className="flex flex-col items-center gap-2 mt-2 w-full max-w-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <Label htmlFor="custom-guests" className="text-xs text-muted-foreground">
            Nhập số lượng khách (từ 9 trở lên)
          </Label>
          <div className="flex items-center gap-2 w-full justify-center">
            <Input
              id="custom-guests"
              type="number"
              min="9"
              max="24"
              value={customPartyValue}
              onChange={(e) => {
                const val = e.target.value
                setCustomPartyValue(val)
                setPartySize(val)
              }}
              className="text-center font-semibold rounded-lg w-28"
            />
            <span className="text-sm font-semibold text-muted-foreground">khách</span>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-2">
        Với nhóm trên 24 khách, vui lòng liên hệ trực tiếp để được sắp xếp riêng.
      </p>
    </div>
  )
}
