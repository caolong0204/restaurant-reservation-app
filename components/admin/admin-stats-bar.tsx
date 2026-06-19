import { useMemo } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import { getTodayIso } from '@/lib/admin-calendar'

import { StatCard } from '@/components/admin/stat-card'
import type { Reservation } from '@/components/reservation-provider'

interface AdminStatsBarProps {
  reservations: Reservation[]
}

export function AdminStatsBar({ reservations }: AdminStatsBarProps) {
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
      pending: activePending,
    }
  }, [reservations])

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <StatCard label="Tổng booking hôm nay" value={stats.todayCount} icon={CalendarDays} colorClass="bg-primary/15 text-primary" />
      <StatCard label="Chờ duyệt" value={stats.pending} icon={Clock} colorClass="bg-amber-500/10 text-amber-700" />
    </div>
  )
}
