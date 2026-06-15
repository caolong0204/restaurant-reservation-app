'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock,
  CalendarDays,
  Check,
  Clock,
  Mail,
  Phone,
  UserRound,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useReservations,
  type Reservation,
  type ReservationStatus,
} from '@/components/reservation-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { RESTAURANT, formatDate, formatTime } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

type Filter = 'all' | ReservationStatus

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-accent/30 text-accent-foreground border-accent/50',
  confirmed: 'bg-primary/15 text-primary border-primary/30',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number | string
  icon: typeof Users
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-serif text-2xl font-semibold text-foreground">
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function ReservationRow({
  reservation,
  onConfirm,
  onCancel,
}: {
  reservation: Reservation
  onConfirm: () => void
  onCancel: () => void
}) {
  const r = reservation
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 font-medium text-foreground">
            <UserRound className="size-4 text-muted-foreground" />
            {r.name}
          </span>
          <Badge
            variant="outline"
            className={cn('capitalize', STATUS_STYLES[r.status])}
          >
            {r.status}
          </Badge>
          {r.occasion && (
            <Badge variant="outline" className="text-muted-foreground">
              {r.occasion}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDate(r.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatTime(r.time)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Mail className="size-3.5" />
            {r.email}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="size-3.5" />
            {r.phone}
          </span>
        </div>

        {r.notes && (
          <p className="max-w-xl text-pretty text-sm italic text-muted-foreground">
            “{r.notes}”
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {r.status !== 'confirmed' && (
          <Button size="sm" className="gap-1.5" onClick={onConfirm}>
            <Check className="size-4" />
            Confirm
          </Button>
        )}
        {r.status !== 'cancelled' && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={onCancel}
          >
            <X className="size-4" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const { reservations, updateStatus } = useReservations()
  const [filter, setFilter] = useState<Filter>('all')

  const stats = useMemo(() => {
    const today = todayISO()
    const todays = reservations.filter(
      (r) => r.date === today && r.status !== 'cancelled',
    )
    return {
      todayCount: todays.length,
      todayCovers: todays.reduce((sum, r) => sum + r.partySize, 0),
      pending: reservations.filter((r) => r.status === 'pending').length,
      confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    }
  }, [reservations])

  const filtered = useMemo(() => {
    const list =
      filter === 'all'
        ? reservations
        : reservations.filter((r) => r.status === filter)
    return [...list].sort((a, b) =>
      a.date === b.date
        ? a.time.localeCompare(b.time)
        : a.date.localeCompare(b.date),
    )
  }, [reservations, filter])

  function handleConfirm(r: Reservation) {
    updateStatus(r.id, 'confirmed')
    toast.success(`Confirmed ${r.name}`, {
      description: `${formatDate(r.date)} at ${formatTime(r.time)}`,
    })
  }

  function handleCancel(r: Reservation) {
    updateStatus(r.id, 'cancelled')
    toast(`Cancelled ${r.name}`, {
      description: `${formatDate(r.date)} at ${formatTime(r.time)}`,
    })
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="font-serif text-lg font-semibold text-foreground">
                {RESTAURANT.name}
              </p>
              <p className="text-xs text-muted-foreground">Staff dashboard</p>
            </div>
          </div>
          <Button
            render={<Link href="/">View site</Link>}
            variant="outline"
            size="sm"
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-5 text-primary" />
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Reservations
          </h1>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Today's bookings" value={stats.todayCount} icon={CalendarDays} />
          <StatCard label="Covers today" value={stats.todayCovers} icon={Users} />
          <StatCard label="Awaiting confirmation" value={stats.pending} icon={Clock} />
          <StatCard label="Confirmed" value={stats.confirmed} icon={Check} />
        </div>

        <div className="mt-8">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                  <CalendarDays className="size-8 text-muted-foreground" />
                  <p className="font-medium text-foreground">
                    No reservations here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nothing matches this filter right now.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filtered.map((r) => (
                    <ReservationRow
                      key={r.id}
                      reservation={r}
                      onConfirm={() => handleConfirm(r)}
                      onCancel={() => handleCancel(r)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
