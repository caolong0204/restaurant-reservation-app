import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Reservation } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

import { useEffect, useState } from 'react'

interface AdminNotificationsProps {
  reservations: Reservation[]
}

export function AdminNotifications({ reservations }: AdminNotificationsProps) {
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('adminLastSeenNotification')
    if (stored) {
      setLastSeenTimestamp(Number(stored))
    }
  }, [])

  const pendingReservations = reservations.filter((r) => r.status === 'pending')
  const pendingCount = pendingReservations.length
  
  const hasNewNotifications = pendingReservations.some(r => r.createdAt > lastSeenTimestamp)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open && pendingReservations.length > 0) {
      const maxTimestamp = Math.max(...pendingReservations.map(r => r.createdAt))
      setLastSeenTimestamp(maxTimestamp)
      localStorage.setItem('adminLastSeenNotification', maxTimestamp.toString())
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative size-9 rounded-lg bg-card"
            aria-label="Thông báo"
          />
        }
      >
        <Bell className="size-4 text-muted-foreground" />
        {hasNewNotifications && !isOpen && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-card" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-4 py-3">
          <span className="text-sm font-bold text-foreground">Thông báo</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {hasNewNotifications ? `${pendingReservations.filter(r => r.createdAt > lastSeenTimestamp).length} mới` : `${pendingCount} chờ duyệt`}
          </span>
        </div>
        <div className="flex max-h-[300px] flex-col overflow-y-auto">
          {pendingReservations
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((r) => {
              const isNew = r.createdAt > lastSeenTimestamp
              return (
                <div 
                  key={r.id} 
                  className={cn(
                    "flex flex-col gap-1 border-b border-border/40 p-4 transition-colors hover:bg-muted/30",
                    isNew ? "bg-primary/10" : ""
                  )}
                >
                  <p className="text-sm text-foreground">
                    Khách hàng <span className="font-semibold">{r.name}</span> vừa đặt bàn mới.
                  </p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Khách đến: <span className="font-medium text-foreground">{r.time} ngày {r.date}</span> • {r.partySize} người
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">
                      Tạo lúc: {new Date(r.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              )
            })}
          {pendingCount === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Không có thông báo mới.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
