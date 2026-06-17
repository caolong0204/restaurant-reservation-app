import { useMemo } from 'react'
import { CalendarDays, Check, Clock, Users } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'

import { StatCard } from '@/components/admin/stat-card'
import type { Reservation } from '@/components/reservation-provider'

interface AdminStatsBarProps {
  reservations: Reservation[]
}

export function AdminStatsBar({ reservations }: AdminStatsBarProps) {
  const counts = useMemo(() => {
    return {
      all: reservations.length,
      pending: reservations.filter((reservation) => reservation.status === 'pending').length,
      confirmed: reservations.filter((reservation) => reservation.status === 'confirmed').length,
      cancelled: reservations.filter((reservation) => reservation.status === 'cancelled').length,
    }
  }, [reservations])

  const stats = useMemo(() => {
    // Luôn tính toán ngày hiện tại theo Múi giờ VN
    const today = formatInTimeZone(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd')
    
    const todays = reservations.filter(
      (reservation) => reservation.date === today && reservation.status !== 'cancelled',
    )
    
    return {
      todayCount: todays.length,
      todayCovers: todays.reduce((sum, reservation) => sum + reservation.partySize, 0),
      pending: counts.pending,
      confirmed: counts.confirmed,
    }
  }, [counts.confirmed, counts.pending, reservations])

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Đặt bàn hôm nay" value={stats.todayCount} icon={CalendarDays} colorClass="text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30" />
      <StatCard label="Tổng khách hôm nay" value={stats.todayCovers} icon={Users} colorClass="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30" />
      <StatCard label="Đang chờ duyệt" value={stats.pending} icon={Clock} colorClass="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30" />
      <StatCard label="Đã xác nhận" value={stats.confirmed} icon={Check} colorClass="text-primary bg-primary/10" />
    </div>
  )
}
