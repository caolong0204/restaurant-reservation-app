import { useMemo } from 'react'
import { CalendarDays, Check, Clock, Users } from 'lucide-react'
import { getTodayIso } from '@/lib/admin-calendar'

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
    const today = getTodayIso()
    
    const todays = reservations.filter(
      (reservation) => reservation.date === today && reservation.status !== 'cancelled',
    )
    const activePending = reservations.filter(
      (reservation) => reservation.status === 'pending' && reservation.date >= today
    ).length
    
    return {
      todayCount: todays.length,
      todayCovers: todays.reduce((sum, reservation) => sum + reservation.partySize, 0),
      pending: activePending,
      todayConfirmed: todays.filter(r => r.status === 'confirmed').length,
    }
  }, [reservations])

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <StatCard label="Đặt bàn hôm nay" value={stats.todayCount} icon={CalendarDays} colorClass="text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30" />
      <StatCard label="Chờ duyệt" value={stats.pending} icon={Clock} colorClass="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30" />
    </div>
  )
}
