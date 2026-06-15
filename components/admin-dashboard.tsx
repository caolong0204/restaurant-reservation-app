'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock,
  CalendarDays,
  Check,
  Clock,
  UtensilsCrossed,
  Search,
  Plus,
  Calendar,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useReservations,
  type Reservation,
  type ReservationStatus,
} from '@/components/reservation-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { RESTAURANT, formatDate } from '@/lib/restaurant'

// Import split sub-components
import { StatCard } from './admin/stat-card'
import { ReservationRow } from './admin/reservation-row'
import { CreateModal } from './admin/create-modal'
import { EditModal } from './admin/edit-modal'

type Filter = 'all' | ReservationStatus

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function AdminDashboard() {
  const { reservations, updateStatus, editReservation, deleteReservation, addReservation } = useReservations()
  const [filter, setFilter] = useState<Filter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Modal toggle states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)

  // Compute statistics
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

  // Filtered list
  const filtered = useMemo(() => {
    return reservations
      .filter((r) => {
        // Status filter
        if (filter !== 'all' && r.status !== filter) return false
        // Search filter
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase()
          const matchesName = r.name.toLowerCase().includes(s)
          const matchesPhone = r.phone.toLowerCase().includes(s)
          const matchesEmail = r.email.toLowerCase().includes(s)
          if (!matchesName && !matchesPhone && !matchesEmail) return false
        }
        // Date filter
        if (dateFilter && r.date !== dateFilter) return false
        return true
      })
      .sort((a, b) =>
        a.date === b.date
          ? a.time.localeCompare(b.time)
          : a.date.localeCompare(b.date),
      )
  }, [reservations, filter, searchTerm, dateFilter])

  function handleConfirm(r: Reservation) {
    updateStatus(r.id, 'confirmed')
    toast.success(`Đã xác nhận đặt bàn cho ${r.name}`)
  }

  function handleCancel(r: Reservation) {
    updateStatus(r.id, 'cancelled')
    toast(`Đã hủy đặt bàn của ${r.name}`)
  }

  function handleDelete(r: Reservation) {
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn lượt đặt bàn của ${r.name}?`)) {
      deleteReservation(r.id)
      toast.success(`Đã xóa lượt đặt bàn của ${r.name}`)
    }
  }

  function openEdit(r: Reservation) {
    setEditingReservation(r)
    setIsEditOpen(true)
  }

  function handleCreateSubmit(data: any) {
    const newRes = addReservation(data)
    updateStatus(newRes.id, 'confirmed') // Auto-confirm for staff

    toast.success(`Đã thêm đặt bàn cho ${data.name}`, {
      description: `Bàn đã tự động được xác nhận.`,
    })
    setIsCreateOpen(false)
  }

  function handleEditSubmit(id: string, data: any) {
    editReservation(id, data)
    toast.success(`Đã cập nhật đặt bàn của ${data.name}`)
    setIsEditOpen(false)
    setEditingReservation(null)
  }

  return (
    <div className="min-h-dvh bg-secondary/15">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/85 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <UtensilsCrossed className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="font-serif text-lg font-bold text-foreground">
                {RESTAURANT.name}
              </p>
              <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Trang quản trị nhân viên</p>
            </div>
          </div>
          <Button
            render={<Link href="/">Quay về trang chủ</Link>}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="rounded-lg text-xs"
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-8 sm:px-4">
        {/* Title and Action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <CalendarClock className="size-5" />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                Danh sách đặt bàn
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Quản lý, tìm kiếm và tạo mới các lượt đặt bàn của khách.</p>
            </div>
          </div>

          <Button
            size="sm"
            className="gap-1.5 shadow-sm shadow-primary/20 self-start sm:self-center"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="size-4" />
            Thêm đặt bàn
          </Button>
        </div>

        {/* Dynamic Stats Row */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Đặt bàn hôm nay" value={stats.todayCount} icon={CalendarDays} colorClass="text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30" />
          <StatCard label="Tổng khách hôm nay" value={stats.todayCovers} icon={Users} colorClass="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30" />
          <StatCard label="Đang chờ duyệt" value={stats.pending} icon={Clock} colorClass="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30" />
          <StatCard label="Đã xác nhận" value={stats.confirmed} icon={Check} colorClass="text-primary bg-primary/10" />
        </div>

        {/* Search & Filter Controls Card */}
        <div className="mt-8 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="grid gap-4 sm:grid-cols-12 items-center">
            {/* Search Input */}
            <div className="relative sm:col-span-7 md:col-span-8">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm tên khách hàng, số điện thoại, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 placeholder:text-muted-foreground/50 text-sm rounded-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative sm:col-span-5 md:col-span-4">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9 pr-8 text-sm rounded-lg cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
              />
              {dateFilter ? (
                <button
                  onClick={() => setDateFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Tất cả
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-semibold text-muted-foreground/60 pointer-events-none">Lọc ngày</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab-based Listing */}
        <div className="mt-6">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <div className="flex items-center justify-between border-b border-border/80 pb-1.5">
              <TabsList className="bg-transparent p-0 gap-1 border-b-0 h-auto">
                <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  Tất cả ({reservations.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  Chờ duyệt ({reservations.filter(r => r.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  Đã xác nhận ({reservations.filter(r => r.status === 'confirmed').length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  Đã hủy ({reservations.filter(r => r.status === 'cancelled').length})
                </TabsTrigger>
              </TabsList>

              {dateFilter && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Ngày lọc: {formatDate(dateFilter)}
                </span>
              )}
            </div>

            <TabsContent value={filter} className="mt-6">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/80 py-20 text-center bg-card shadow-xs">
                  <CalendarDays className="size-9 text-muted-foreground/60" />
                  <div>
                    <p className="font-serif text-base font-bold text-foreground">
                      Không tìm thấy lượt đặt bàn nào
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">
                      Vui lòng kiểm tra lại bộ lọc, ô tìm kiếm hoặc ngày được chọn.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filtered.map((r) => (
                    <ReservationRow
                      key={r.id}
                      reservation={r}
                      onConfirm={() => handleConfirm(r)}
                      onCancel={() => handleCancel(r)}
                      onEdit={() => openEdit(r)}
                      onDelete={() => handleDelete(r)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* CREATE MODAL */}
      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* EDIT MODAL */}
      <EditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setEditingReservation(null)
        }}
        reservation={editingReservation}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
