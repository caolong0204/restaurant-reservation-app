'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  CalendarClock,
  CalendarDays,
  Check,
  Clock,
  LogOut,
  Plus,
  RefreshCcw,
  Search,
  UtensilsCrossed,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { AssignTableModal } from '@/components/admin/assign-table-modal'
import { CreateModal } from '@/components/admin/create-modal'
import { DayCalendarView } from '@/components/admin/day-calendar-view'
import { EditModal } from '@/components/admin/edit-modal'
import { ReservationTable } from '@/components/admin/reservation-table'
import { StatCard } from '@/components/admin/stat-card'
import {
  useReservations,
  type Reservation,
  type ReservationInput,
  type ReservationStatus,
  type RestaurantTable,
} from '@/components/reservation-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RestaurantCalendar } from '@/components/ui/restaurant-calendar'
import { signOutAdmin } from '@/lib/auth-actions'
import { RESTAURANT, formatDate } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

type Filter = 'all' | ReservationStatus
type AdminView = 'reservations' | 'calendar'

function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'cancelled', label: 'Đã hủy' },
]

export function AdminDashboard() {
  const {
    reservations,
    tables,
    isLoading,
    actionError,
    authMode,
    refreshAdminData,
    createManualReservation,
    confirmReservation,
    cancelReservation,
    editReservation,
    getAvailableTables,
  } = useReservations()

  const [view, setView] = useState<AdminView>('reservations')
  const [filter, setFilter] = useState<Filter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState(todayISO())

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)

  const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null)
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)

  const counts = useMemo(() => {
    return {
      all: reservations.length,
      pending: reservations.filter((reservation) => reservation.status === 'pending').length,
      confirmed: reservations.filter((reservation) => reservation.status === 'confirmed').length,
      cancelled: reservations.filter((reservation) => reservation.status === 'cancelled').length,
    }
  }, [reservations])

  const stats = useMemo(() => {
    const today = todayISO()
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

  const filtered = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return reservations
      .filter((reservation) => {
        if (filter !== 'all' && reservation.status !== filter) return false
        if (dateFilter && reservation.date !== dateFilter) return false
        if (!normalizedSearch) return true

        return (
          reservation.name.toLowerCase().includes(normalizedSearch) ||
          reservation.phone.toLowerCase().includes(normalizedSearch) ||
          reservation.email.toLowerCase().includes(normalizedSearch) ||
          reservation.table?.code.toLowerCase().includes(normalizedSearch)
        )
      })
      .sort((a, b) =>
        a.date === b.date
          ? a.time.localeCompare(b.time)
          : a.date.localeCompare(b.date),
      )
  }, [reservations, filter, searchTerm, dateFilter])

  async function openAssignModal(reservation: Reservation) {
    setAssigningReservation(reservation)
    setAvailableTables([])
    setIsLoadingTables(true)

    const result = await getAvailableTables(
      reservation.date,
      reservation.time,
      reservation.partySize,
      reservation.id,
    )

    if (result.ok) {
      setAvailableTables(result.data)
    } else {
      toast.error('Không tải được bàn trống', {
        description: result.error,
      })
    }

    setIsLoadingTables(false)
  }

  async function handleAssignConfirm(tableId: string, secondaryTableIds: string[] = []) {
    if (!assigningReservation) return

    const result = await confirmReservation(assigningReservation.id, tableId, secondaryTableIds)
    if (result.ok) {
      const mainCode = result.data.table?.code ?? ''
      const secCodes = result.data.secondaryTables && result.data.secondaryTables.length > 0
        ? ` + ${result.data.secondaryTables.map((t) => t.code).join(' + ')}`
        : ''
      toast.success(`Đã xác nhận đặt bàn cho ${result.data.name}`, {
        description: `Bàn ${mainCode}${secCodes} đã được gán.`,
      })
      setAssigningReservation(null)
      setAvailableTables([])
      return
    }

    toast.error('Không xác nhận được đặt bàn', {
      description: result.error,
    })
  }

  async function handleCancel(reservation: Reservation) {
    const result = await cancelReservation(reservation.id)
    if (result.ok) {
      toast(`Đã hủy đặt bàn của ${reservation.name}`)
      return
    }

    toast.error('Không hủy được đặt bàn', {
      description: result.error,
    })
  }


  function openEdit(reservation: Reservation) {
    setEditingReservation(reservation)
    setIsEditOpen(true)
  }

  async function handleCreateSubmit(data: ReservationInput) {
    const result = await createManualReservation(data)
    if (result.ok) {
      toast.success(`Đã thêm đặt bàn cho ${data.name}`, {
        description: 'Booking đang chờ gán bàn để xác nhận.',
      })
      setIsCreateOpen(false)
      return
    }

    toast.error('Không thêm được đặt bàn', {
      description: result.error,
    })
  }

  async function handleEditSubmit(id: string, data: ReservationInput) {
    const result = await editReservation(id, data)
    if (result.ok) {
      toast.success(`Đã cập nhật đặt bàn của ${data.name}`)
      setIsEditOpen(false)
      setEditingReservation(null)
      return
    }

    toast.error('Không cập nhật được đặt bàn', {
      description: result.error,
    })
  }

  return (
    <div className="min-h-dvh bg-secondary/15">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/85 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <UtensilsCrossed className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="font-serif text-lg font-bold text-foreground">
                {RESTAURANT.name}
              </p>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Trang quản trị nhân viên · {authMode === 'demo' ? 'Demo mode' : 'Supabase'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              render={<Link href="/">Trang chủ</Link>}
              nativeButton={false}
              variant="outline"
              size="sm"
              className="rounded-lg text-xs"
            />
            <form action={signOutAdmin}>
              <Button type="submit" variant="ghost" size="sm" className="gap-1 rounded-lg text-xs">
                <LogOut className="size-3.5" />
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <CalendarClock className="size-5" />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                Điều phối đặt bàn
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Quản lý booking, kiểm tra lịch và gán bàn khi xác nhận.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => void refreshAdminData()}
              disabled={isLoading}
            >
              <RefreshCcw className={cn('size-4', isLoading && 'animate-spin')} />
              Làm mới
            </Button>
            <Button
              size="sm"
              className="gap-1.5 shadow-sm shadow-primary/20"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-4" />
              Thêm đặt bàn
            </Button>
          </div>
        </div>

        {actionError && (
          <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Đặt bàn hôm nay" value={stats.todayCount} icon={CalendarDays} colorClass="text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30" />
          <StatCard label="Tổng khách hôm nay" value={stats.todayCovers} icon={Users} colorClass="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30" />
          <StatCard label="Đang chờ duyệt" value={stats.pending} icon={Clock} colorClass="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30" />
          <StatCard label="Đã xác nhận" value={stats.confirmed} icon={Check} colorClass="text-primary bg-primary/10" />
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-border/80 pb-2">
          <button
            type="button"
            onClick={() => setView('reservations')}
            className={cn(
              'rounded-lg px-3 py-2 text-xs font-bold transition-colors',
              view === 'reservations' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            Danh sách
          </button>
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={cn(
              'rounded-lg px-3 py-2 text-xs font-bold transition-colors',
              view === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            Lịch ngày
          </button>
        </div>

        {view === 'reservations' ? (
          <>
            <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="grid items-center gap-4 sm:grid-cols-12">
                <div className="relative sm:col-span-7 md:col-span-8">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tìm tên khách, số điện thoại, email, mã bàn..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="rounded-lg pl-9 text-sm placeholder:text-muted-foreground/50"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <div className="relative sm:col-span-5 md:col-span-4">
                  <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-full justify-start text-left font-normal pl-9 text-sm h-9 rounded-lg relative bg-background border border-input shadow-xs',
                          !dateFilter && 'text-muted-foreground',
                        )}
                      >
                        <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        {dateFilter ? formatDate(dateFilter) : 'Tất cả ngày'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none animate-in fade-in-50 slide-in-from-top-1 duration-150" align="end">
                      <RestaurantCalendar
                        selected={dateFilter ? new Date(`${dateFilter}T00:00:00`) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const day = String(date.getDate()).padStart(2, '0')
                            setDateFilter(`${year}-${month}-${day}`)
                          } else {
                            setDateFilter('')
                          }
                          setIsDateFilterOpen(false)
                        }}
                      />
                      {dateFilter && (
                        <div className="p-2 bg-background border-t border-border flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg h-8 px-2"
                            onClick={() => {
                              setDateFilter('')
                              setIsDateFilterOpen(false)
                            }}
                          >
                            Xóa lọc ngày
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-2">
              <div className="flex flex-wrap gap-1">
                {FILTERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={cn(
                      'rounded-none border-b-2 border-transparent px-3 py-2 text-xs font-semibold transition-colors',
                      filter === item.value
                        ? 'border-primary text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {item.label} ({counts[item.value]})
                  </button>
                ))}
              </div>

              {dateFilter && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Ngày lọc: {formatDate(dateFilter)}
                </span>
              )}
            </div>

            <div className="mt-6">
              {isLoading ? (
                <div className="rounded-xl border border-border bg-card py-16 text-center text-sm text-muted-foreground shadow-xs">
                  Đang tải danh sách đặt bàn...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/80 bg-card py-20 text-center shadow-xs">
                  <CalendarDays className="size-9 text-muted-foreground/60" />
                  <div>
                    <p className="font-serif text-base font-bold text-foreground">
                      Không tìm thấy lượt đặt bàn nào
                    </p>
                    <p className="mx-auto mt-1 max-w-[280px] text-xs text-muted-foreground">
                      Vui lòng kiểm tra lại bộ lọc, ô tìm kiếm hoặc ngày được chọn.
                    </p>
                  </div>
                </div>
              ) : (
                <ReservationTable
                  reservations={filtered}
                  onConfirm={(reservation) => void openAssignModal(reservation)}
                  onCancel={(reservation) => void handleCancel(reservation)}
                  onEdit={openEdit}
                />
              )}
            </div>
          </>
        ) : (
          <div className="mt-6">
            <DayCalendarView
              reservations={reservations}
              tables={tables}
              selectedDate={calendarDate}
              onDateChange={setCalendarDate}
              onConfirm={(reservation) => void openAssignModal(reservation)}
              onCancel={(reservation) => void handleCancel(reservation)}
              onEdit={openEdit}
            />
          </div>
        )}
      </main>

      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setEditingReservation(null)
        }}
        reservation={editingReservation}
        onSubmit={handleEditSubmit}
        tables={tables}
      />

      <AssignTableModal
        isOpen={Boolean(assigningReservation)}
        reservation={assigningReservation}
        availableTables={availableTables}
        isLoading={isLoadingTables}
        onClose={() => {
          setAssigningReservation(null)
          setAvailableTables([])
        }}
        onConfirm={(tableId, secondaryTableIds) => void handleAssignConfirm(tableId, secondaryTableIds)}
      />
    </div>
  )
}
