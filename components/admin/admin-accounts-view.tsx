'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Search, UserPlus } from 'lucide-react'

import { CreateAccountModal } from '@/components/admin/accounts/create-account-card'
import { PasswordCard } from '@/components/admin/accounts/password-card'
import { StaffAccountsTable } from '@/components/admin/accounts/staff-accounts-table'
import type { StaffAccount, StaffRole } from '@/lib/reservation-types'

export function AdminAccountsView({
  initialAccounts,
  currentUserId,
}: {
  initialAccounts: StaffAccount[]
  currentUserId?: string
}) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1
        if (a.role !== b.role) return a.role === 'admin' ? -1 : 1
        return a.displayName.localeCompare(b.displayName)
      }),
    [accounts],
  )
  const filteredAccounts = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase()
    return sortedAccounts.filter((account) => {
      if (roleFilter !== 'all' && account.role !== roleFilter) return false
      if (statusFilter === 'active' && !account.active) return false
      if (statusFilter === 'inactive' && account.active) return false
      if (!needle) return true
      return [account.displayName, account.email].some((value) =>
        value.toLowerCase().includes(needle),
      )
    })
  }, [roleFilter, searchTerm, sortedAccounts, statusFilter])


  const upsertAccount = (account: StaffAccount) => {
    setAccounts((current) => {
      const exists = current.some((item) => item.userId === account.userId)
      if (!exists) return [...current, account]
      return current.map((item) => (item.userId === account.userId ? account : item))
    })
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid gap-3 md:grid-cols-[minmax(280px,1.4fr)_220px_220px]">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-flambe-espresso" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm tên, email..."
              className="h-12 w-full rounded-lg border border-border bg-card pl-12 pr-4 text-sm outline-none focus-visible:border-ring"
            />
          </label>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as StaffRole | 'all')}
            className="h-12 rounded-lg border border-border bg-card px-4 text-sm font-semibold outline-none focus-visible:border-ring"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="staff">Nhân viên</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')
            }
            className="h-12 rounded-lg border border-border bg-card px-4 text-sm font-semibold outline-none focus-visible:border-ring"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm khóa</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-flambe-rust px-6 text-sm font-bold text-white shadow-xs hover:bg-flambe-rust-hover"
        >
          <UserPlus className="size-5" />
          Tạo tài khoản
        </button>
      </div>


      <StaffAccountsTable
        accounts={filteredAccounts}
        currentUserId={currentUserId}
        onUpdated={upsertAccount}
      />

      <div className="flex max-w-[470px] flex-col gap-4">
        <PasswordCard />
        <div className="flex min-h-14 items-center rounded-lg border border-flambe-gold/35 bg-flambe-gold/10 px-4 text-sm font-semibold text-flambe-brown">
          <AlertTriangle className="mr-3 size-5 shrink-0 text-flambe-gold" />
          Không thể khóa hoặc hạ quyền admin cuối cùng.
        </div>
      </div>

      <CreateAccountModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={upsertAccount}
      />
    </div>
  )
}

