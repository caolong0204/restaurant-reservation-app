'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { TableFormModal } from '@/components/admin/settings/table-form-modal'
import { TableSettingsTable } from '@/components/admin/settings/table-settings-table'
import { TableSettingsToolbar } from '@/components/admin/settings/table-settings-toolbar'
import { TableSummaryCards } from '@/components/admin/settings/table-summary-cards'
import { OperatingHoursSettings } from '@/components/admin/settings/operating-hours-settings'
import {
  BLOCKING_STATUSES,
  todayIso,
  usesTable,
  type StatusFilter,
  type TableCounts,
} from '@/components/admin/settings/table-settings-shared'
import { WalkInTargetAlert } from '@/components/admin/settings/walk-in-target-alert'
import type {
  OperatingHoursSnapshot,
  Reservation,
  RestaurantTable,
} from '@/lib/reservation-types'

export function AdminSettingsView({
  tables,
  reservations,
  isLoading,
  onRefresh,
  operatingHours,
  onOperatingHoursSaved,
}: {
  tables: RestaurantTable[]
  reservations: Reservation[]
  isLoading: boolean
  onRefresh: () => Promise<void>
  operatingHours: OperatingHoursSnapshot
  onOperatingHoursSaved: (snapshot: OperatingHoursSnapshot) => void
}) {
  const [activeTab, setActiveTab] = useState<'tables' | 'hours'>('tables')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null)

  const futureReservationsByTable = useMemo(() => {
    const today = todayIso()
    return tables.reduce<Record<string, Reservation[]>>((acc, table) => {
      acc[table.id] = reservations
        .filter(
          (reservation) =>
            reservation.date >= today &&
            BLOCKING_STATUSES.has(reservation.status) &&
            usesTable(reservation, table.id),
        )
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      return acc
    }, {})
  }, [reservations, tables])

  const futureCounts = useMemo(
    () =>
      tables.reduce<Record<string, number>>((acc, table) => {
        acc[table.id] = futureReservationsByTable[table.id]?.length ?? 0
        return acc
      }, {}),
    [futureReservationsByTable, tables],
  )

  const counts = useMemo<TableCounts>(
    () => ({
      total: tables.length,
      active: tables.filter((table) => table.availabilityStatus === 'active').length,
      walkIn: tables.filter((table) => table.availabilityStatus === 'held_for_walk_in').length,
      inactive: tables.filter((table) => table.availabilityStatus === 'inactive').length,
    }),
    [tables],
  )

  const hasWalkInTarget = useMemo(() => {
    const walkInTables = tables.filter((table) => table.availabilityStatus === 'held_for_walk_in')
    return (
      walkInTables.filter((table) => table.capacity === 2).length === 1 &&
      walkInTables.filter((table) => table.capacity === 4).length === 1 &&
      walkInTables.length === 2
    )
  }, [tables])

  const filteredTables = useMemo(
    () =>
      tables
        .filter((table) => {
          if (statusFilter !== 'all' && table.availabilityStatus !== statusFilter) return false
          const needle = searchTerm.trim().toLowerCase()
          if (!needle) return true
          return [table.code, table.floor, table.area, table.notes ?? ''].some((value) =>
            value.toLowerCase().includes(needle),
          )
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [searchTerm, statusFilter, tables],
  )


  const refresh = async () => {
    await onRefresh()
    toast.success('Đã làm mới cài đặt bàn')
  }

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70">
        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={activeTab === 'tables'
            ? 'border-b-2 border-flambe-rust px-3 py-2 text-sm font-bold text-foreground'
            : 'px-3 py-2 text-sm font-semibold text-muted-foreground'}
        >
          Bàn
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hours')}
          className={activeTab === 'hours'
            ? 'border-b-2 border-flambe-rust px-3 py-2 text-sm font-bold text-foreground'
            : 'px-3 py-2 text-sm font-semibold text-muted-foreground'}
        >
          Giờ hoạt động
        </button>
      </div>

      {activeTab === 'hours' ? (
        <OperatingHoursSettings
          snapshot={operatingHours}
          onSaved={onOperatingHoursSaved}
        />
      ) : (
        <>
          <WalkInTargetAlert hasWalkInTarget={hasWalkInTarget} />
          <TableSummaryCards counts={counts} />

          <TableSettingsToolbar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        isLoading={isLoading}
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onRefresh={() => void refresh()}
        onCreate={() => setIsCreateOpen(true)}
      />

      <TableSettingsTable
        tables={filteredTables}
        futureCounts={futureCounts}
        futureReservations={futureReservationsByTable}
        expandedTableId={expandedTableId}
        onToggleFutureBookings={(tableId) =>
          setExpandedTableId((current) => (current === tableId ? null : tableId))
        }
        onEdit={setEditingTable}
      />

      {(editingTable || isCreateOpen) && (
        <TableFormModal
          table={editingTable}
          defaultSortOrder={(tables.at(-1)?.sortOrder ?? 0) + 1}
          onClose={() => {
            setEditingTable(null)
            setIsCreateOpen(false)
          }}
          onSaved={onRefresh}
        />
      )}
        </>
      )}
    </div>
  )
}
