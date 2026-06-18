'use client'

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
    <div className="flex flex-col items-center gap-3 py-0.5 text-center">
      <div className="flex flex-col items-center">
        <h4 className="font-serif text-xl sm:text-2xl font-medium tracking-wide text-flambe-text-dark uppercase mt-2 mb-4">
          CHỌN SỐ LƯỢNG KHÁCH
        </h4>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden">
          Vui lòng chọn số lượng người tham gia dùng bữa cùng bạn
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-1">
        {PARTY_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => {
              setPartySize(String(size))
              setIsCustomParty(false)
            }}
            className={cn(
              'flex h-[52px] items-center justify-center rounded-[10px] border text-lg font-medium transition-all duration-200',
              !isCustomParty && partySize === String(size)
                ? 'border-flambe-rust bg-flambe-rust text-white shadow-md'
                : 'border-flambe-border-cream bg-flambe-cream-light hover:border-flambe-rust/50 text-flambe-text-dark'
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
            'flex h-[52px] items-center justify-center rounded-[10px] border text-lg font-medium transition-all duration-200',
            isCustomParty
              ? 'border-flambe-rust bg-flambe-rust text-white shadow-md'
              : 'border-flambe-border-cream bg-flambe-cream-light hover:border-flambe-rust/50 text-flambe-text-dark'
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
