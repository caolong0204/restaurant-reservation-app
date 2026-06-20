'use client'

import { useState, useTransition } from 'react'
import {
  Loader2,
  Pencil,
  X,
  Eye,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

import { updateStaffAccount, deleteStaffAccount } from '@/lib/admin-account-actions'
import type { StaffAccount, StaffRole } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

export function StaffAccountsTable({
  accounts,
  currentUserId,
  onUpdated,
}: {
  accounts: StaffAccount[]
  currentUserId?: string
  onUpdated: (account: StaffAccount) => void
}) {
  return (
    <section className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
      <div className="min-w-[920px]">
        <div className="grid grid-cols-[minmax(180px,1.25fr)_minmax(180px,1fr)_100px_150px_100px_140px_80px] gap-3 border-b border-border bg-secondary/35 px-5 py-3 text-sm font-bold text-flambe-brown">
          <span>Nhân viên</span>
          <span>Email</span>
          <span>Vai trò</span>
          <span>Trạng thái</span>
          <span>Tạo lúc</span>
          <span>Đăng nhập gần đây</span>
          <span>Thao tác</span>
        </div>
        <div className="divide-y divide-border/70">
          {accounts.map((account) => (
            <StaffAccountRow
              key={account.userId}
              account={account}
              isCurrent={account.userId === currentUserId}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function StaffAccountRow({
  account,
  isCurrent,
  onUpdated,
}: {
  account: StaffAccount
  isCurrent: boolean
  onUpdated: (account: StaffAccount) => void
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  return (
    <>
      <div>
        <div className="grid grid-cols-[minmax(180px,1.25fr)_minmax(180px,1fr)_100px_150px_100px_140px_80px] items-center gap-3 px-5 py-3.5 hover:bg-secondary/20">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                account.role === 'admin'
                  ? 'bg-flambe-gold/15 text-flambe-rust'
                  : 'bg-flambe-olive/15 text-flambe-forest',
              )}
            >
              {initials(account.displayName)}
            </span>
            <span className="truncate text-sm font-bold text-foreground">
              {account.displayName}
            </span>
          </div>

          <p className="truncate text-sm text-foreground">{account.email}</p>

          <span
            className={cn(
              'inline-flex h-9 w-fit items-center rounded-lg border bg-background px-3 text-sm font-bold',
              account.role === 'admin'
                ? 'border-flambe-gold text-flambe-rust'
                : 'border-flambe-olive/50 text-flambe-forest',
            )}
          >
            {account.role === 'admin' ? 'Admin' : 'Nhân viên'}
          </span>

          <span
            className={cn(
              'inline-flex h-9 w-fit items-center gap-2 rounded-lg border px-3 text-sm font-semibold',
              account.active
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-border bg-secondary/40 text-muted-foreground',
            )}
          >
            <span className={cn('size-2 rounded-full', account.active ? 'bg-emerald-600' : 'bg-muted-foreground')} />
            {account.active ? 'Đang hoạt động' : 'Tạm khóa'}
          </span>

          <span className="text-sm text-foreground">{formatDate(account.createdAt)}</span>
          <span className="text-sm text-muted-foreground">{isCurrent ? 'Đang đăng nhập' : '-'}</span>

          <div className="flex items-center gap-2">
            <IconButton label="Chỉnh sửa" onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="size-4" />
            </IconButton>
          </div>
        </div>
      </div>

      <EditAccountModal
        account={account}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={onUpdated}
        isCurrent={isCurrent}
      />
    </>
  )
}

function EditAccountModal({
  account,
  isOpen,
  onClose,
  onUpdated,
  isCurrent,
}: {
  account: StaffAccount
  isOpen: boolean
  onClose: () => void
  onUpdated: (account: StaffAccount) => void
  isCurrent: boolean
}) {
  const [displayName, setDisplayName] = useState(account.displayName)
  const [role, setRole] = useState<StaffRole>(account.role)
  const [active, setActive] = useState(account.active)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  if (!isOpen) return null

  const save = () => {
    startTransition(async () => {
      const result = await updateStaffAccount({
        userId: account.userId,
        displayName,
        role,
        active,
        password: password || undefined,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      onUpdated(result.data)
      onClose()
      toast.success('Đã cập nhật tài khoản')
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteStaffAccount(account.userId)
      if (!result.ok) {
        toast.error(result.error)
        setIsDeleteModalOpen(false)
        return
      }
      toast.success('Đã xóa tài khoản')
      // Note: We might need a slightly different way to remove the row from UI,
      // but reloading the page or triggering a refresh via the parent is usually handled
      // by the revalidatePath in the server action. We will just close the modal.
      // If we want instant UI update, we could pass an onDeleted callback.
      // We will reload the page here for simplicity and safety.
      window.location.reload()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[600px] rounded-lg border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Pencil className="size-5 text-flambe-rust" />
            <h2 className="font-serif text-2xl font-bold text-foreground">Chỉnh sửa tài khoản</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-5">
          <label className="space-y-1.5 text-sm font-semibold text-foreground">
            <span>Tên hiển thị</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Nhập tên hiển thị"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus-visible:border-ring"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              <span>Email</span>
              <input
                value={account.email}
                disabled
                className="h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-muted-foreground outline-none"
              />
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              <span>Đổi mật khẩu (không bắt buộc)</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="h-10 w-full rounded-lg border border-input bg-background pl-3 pr-10 outline-none focus-visible:border-ring"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Eye className="size-4" />
                </button>
              </div>
            </label>
          </div>

          <div className="space-y-1.5 text-sm font-semibold text-foreground">
            <span>Vai trò</span>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3',
                  role === 'admin'
                    ? 'border-flambe-rust bg-flambe-rust/5'
                    : 'border-border hover:bg-secondary/50',
                )}
              >
                <div
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border',
                    role === 'admin' ? 'border-flambe-rust bg-flambe-rust' : 'border-muted-foreground',
                  )}
                >
                  {role === 'admin' && <span className="size-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="font-bold text-foreground">Admin</div>
                  <div className="text-xs font-normal text-muted-foreground">Toàn quyền hệ thống</div>
                </div>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="sr-only"
                />
              </label>
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3',
                  role === 'staff'
                    ? 'border-flambe-rust bg-flambe-rust/5'
                    : 'border-border hover:bg-secondary/50',
                )}
              >
                <div
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border',
                    role === 'staff' ? 'border-flambe-rust bg-flambe-rust' : 'border-muted-foreground',
                  )}
                >
                  {role === 'staff' && <span className="size-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="font-bold text-foreground">Nhân viên</div>
                  <div className="text-xs font-normal text-muted-foreground">Quản lý đặt bàn</div>
                </div>
                <input
                  type="radio"
                  name="role"
                  value="staff"
                  checked={role === 'staff'}
                  onChange={() => setRole('staff')}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
          
          <div className="space-y-1.5 text-sm font-semibold text-foreground">
            <span>Trạng thái</span>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3',
                  active
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-border hover:bg-secondary/50',
                )}
              >
                <div
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border',
                    active ? 'border-emerald-600 bg-emerald-600' : 'border-muted-foreground',
                  )}
                >
                  {active && <span className="size-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="font-bold text-foreground">Đang hoạt động</div>
                </div>
                <input
                  type="radio"
                  name="active"
                  checked={active === true}
                  onChange={() => setActive(true)}
                  disabled={isCurrent && account.role === 'admin'}
                  className="sr-only"
                />
              </label>
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3',
                  !active
                    ? 'border-flambe-rust bg-flambe-rust/5'
                    : 'border-border hover:bg-secondary/50',
                  (isCurrent && account.role === 'admin') ? 'opacity-50 cursor-not-allowed' : ''
                )}
              >
                <div
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border',
                    !active ? 'border-flambe-rust bg-flambe-rust' : 'border-muted-foreground',
                  )}
                >
                  {!active && <span className="size-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="font-bold text-foreground">Tạm khóa</div>
                </div>
                <input
                  type="radio"
                  name="active"
                  checked={active === false}
                  onChange={() => {
                    if (!(isCurrent && account.role === 'admin')) {
                      setActive(false)
                    }
                  }}
                  disabled={isCurrent && account.role === 'admin'}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            {!isCurrent && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 className="size-4" />
                Xóa tài khoản
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={save}
              disabled={isPending}
              className="inline-flex h-10 min-w-[140px] items-center justify-center gap-2 rounded-lg bg-flambe-rust px-5 text-sm font-bold text-white shadow-xs hover:bg-flambe-rust-hover disabled:opacity-60"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[400px] rounded-lg border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle className="size-6" />
              <h2 className="text-lg font-bold">Xóa tài khoản?</h2>
            </div>
            <p className="text-sm text-foreground mt-2">
              Bạn có chắc chắn muốn xóa tài khoản <strong>{account.displayName}</strong> ({account.email})? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-50"
    >
      {children}
    </button>
  )
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0]?.[0], parts.at(-1)?.[0]] : [name[0], name[1]]
  return letters.filter(Boolean).join('').toUpperCase()
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('vi-VN')
}
