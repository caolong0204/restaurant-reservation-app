import { CalendarDays, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import { TimePickerDropdown } from '@/components/admin/time-picker-dropdown'
import { OCCASIONS, formatDate } from '@/lib/restaurant'

interface AdminSchedulingFieldsProps {
  date: string
  onDateChange: (date: string) => void
  isCalendarOpen: boolean
  setIsCalendarOpen: (open: boolean) => void
  minDate?: Date

  time: string
  onTimeChange: (time: string) => void
  isTimeOpen: boolean
  setIsTimeOpen: (open: boolean) => void
  availableTimeSlots: string[]

  partySize: string
  onPartySizeChange: (size: string) => void

  occasion: string
  onOccasionChange: (occasion: string) => void
}

export function AdminSchedulingFields({
  date,
  onDateChange,
  isCalendarOpen,
  setIsCalendarOpen,
  minDate,
  time,
  onTimeChange,
  isTimeOpen,
  setIsTimeOpen,
  availableTimeSlots,
  partySize,
  onPartySizeChange,
  occasion,
  onOccasionChange,
}: AdminSchedulingFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_0.9fr_1.2fr]">
      <div className="flex flex-col justify-end gap-1.5">
        <Label htmlFor="dateField" className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
          Ngày dùng bữa
        </Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger
            render={
              <Button
                id="dateField"
                variant="outline"
                className="h-8 w-full justify-start rounded-lg border border-input bg-background/70 px-3 pl-3 text-left text-sm font-normal shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            }
          >
            <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
            <span className={date ? 'text-foreground' : 'text-muted-foreground/60'}>
              {date ? formatDate(date) : 'Chọn ngày'}
            </span>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto animate-in border-none p-0 duration-150 fade-in-50 slide-in-from-top-1"
            align="start"
          >
            <RestaurantCalendar
              selected={date ? new Date(`${date}T00:00:00`) : undefined}
              minDate={minDate}
              onSelect={(d) => {
                if (d) {
                  const year = d.getFullYear()
                  const month = String(d.getMonth() + 1).padStart(2, '0')
                  const day = String(d.getDate()).padStart(2, '0')
                  onDateChange(`${year}-${month}-${day}`)
                } else {
                  onDateChange('')
                }
                setIsCalendarOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col justify-end gap-1.5">
        <Label htmlFor="timeField" className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
          Giờ đón khách
        </Label>
        <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
          <PopoverTrigger
            render={
              <Button
                id="timeField"
                variant="outline"
                className="h-8 w-full justify-start rounded-lg border border-input bg-background/70 px-3 pl-3 text-left text-sm font-normal shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            }
          >
            <Clock className="mr-2 size-4 shrink-0 text-muted-foreground" />
            <span className={time ? 'text-foreground' : 'text-muted-foreground/60'}>
              {time || 'Chọn giờ'}
            </span>
          </PopoverTrigger>
          <PopoverContent className="max-h-[350px] w-80 overflow-y-auto p-3" align="start">
            <TimePickerDropdown
              slots={availableTimeSlots}
              selectedTime={time}
              onTimeSelect={onTimeChange}
              onClose={() => setIsTimeOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col justify-end gap-1.5">
        <Label htmlFor="partySizeField" className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
          Số lượng khách
        </Label>
        <Input
          id="partySizeField"
          name="party-size"
          autoComplete="off"
          type="number"
          min="1"
          max="24"
          value={partySize}
          onChange={(e) => onPartySizeChange(e.target.value)}
          required
          className="h-8 rounded-lg bg-background/70 text-sm"
        />
      </div>

      <div className="flex flex-col justify-end gap-1.5">
        <Label htmlFor="occasionField" className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
          Dịp đặc biệt
        </Label>
        <select
          id="occasionField"
          name="occasion"
          value={occasion}
          onChange={(e) => onOccasionChange(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-background/70 px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {OCCASIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
