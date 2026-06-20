'use client'

import { Clock, MapPin, Phone } from 'lucide-react'
import { RESTAURANT } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

interface RestaurantInfoProps {
  className?: string
  glassTheme?: boolean
  hourLabels?: string[]
}

export function RestaurantInfo({
  className,
  glassTheme = false,
  hourLabels = RESTAURANT.hours,
}: RestaurantInfoProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        glassTheme && 'bg-black/25 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-xl max-w-sm ml-auto',
        className
      )}
    >
      <div>
        <p className={cn('font-mono text-xs uppercase tracking-widest', glassTheme ? 'text-primary-foreground/80' : 'text-primary')}>
          Thông tin nhà hàng
        </p>
        <h4 className="mt-1 font-serif text-2xl font-bold tracking-tight">
          {RESTAURANT.name}
        </h4>
      </div>

      <div className="flex flex-col gap-4">
        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className={cn('mt-0.5 size-5 shrink-0', glassTheme ? 'text-white' : 'text-primary')} />
          <div>
            <p className="font-semibold text-sm">Địa chỉ</p>
            <p className={cn('text-xs mt-0.5', glassTheme ? 'text-white/80' : 'text-muted-foreground')}>
              {RESTAURANT.address}
            </p>
          </div>
        </div>

        {/* Hours */}
        <div className="flex items-start gap-3">
          <Clock className={cn('mt-0.5 size-5 shrink-0', glassTheme ? 'text-white' : 'text-primary')} />
          <div>
            <p className="font-semibold text-sm">Giờ hoạt động</p>
            <p className={cn('text-xs mt-0.5', glassTheme ? 'text-white/80' : 'text-muted-foreground')}>
              {hourLabels.join(' · ')}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <Phone className={cn('mt-0.5 size-5 shrink-0', glassTheme ? 'text-white' : 'text-primary')} />
          <div>
            <p className="font-semibold text-sm">Liên hệ</p>
            <p className={cn('text-xs mt-0.5', glassTheme ? 'text-white/80' : 'text-muted-foreground')}>
              {RESTAURANT.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
