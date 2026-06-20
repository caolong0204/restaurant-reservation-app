'use client'

import { useState, useTransition } from 'react'
import { Eye, Loader2, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'

import { createStaffAccount } from '@/lib/admin-account-actions'
import type { StaffAccount, StaffRole } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

export function CreateAccountModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onCreated: (account: StaffAccount) => void
}) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<StaffRole>('admin')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const create = () => {
    startTransition(async () => {
      const result = await createStaffAccount({ email, displayName, role, password })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      onCreated(result.data)
      setEmail('')
      setDisplayName('')
      setRole('admin')
      setPassword('')
      onClose()
      toast.success('Đã tạo tài khoản')
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[600px] rounded-lg border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-flambe-rust" />
            <h2 className="font-serif text-2xl font-bold text-foreground">Tạo tài khoản</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <Input label="Tên hiển thị" value={displayName} onChange={setDisplayName} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Email" value={email} onChange={setEmail} type="email" />
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              <span>Mật khẩu tạm thời</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu tạm thời"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 outline-none focus-visible:border-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
                >
                  <Eye className="size-4" />
                </button>
              </div>
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Vai trò</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <RoleOption
                active={role === 'admin'}
                label="Admin"
                description="Toàn quyền quản lý hệ thống"
                onClick={() => setRole('admin')}
              />
              <RoleOption
                active={role === 'staff'}
                label="Nhân viên"
                description="Quản lý đặt bàn và danh sách khách"
                onClick={() => setRole('staff')}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-bold hover:bg-secondary"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={create}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-flambe-rust px-6 text-sm font-bold text-white hover:bg-flambe-rust-hover disabled:opacity-60"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  )
}

function RoleOption({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border p-3 text-left transition-colors',
        active ? 'border-flambe-rust bg-flambe-rust/5' : 'border-border hover:bg-secondary/50',
      )}
    >
      <span className="flex items-center gap-2 text-sm font-bold">
        <span
          className={cn(
            'flex size-4 items-center justify-center rounded-full border',
            active ? 'border-flambe-rust bg-flambe-rust' : 'border-border',
          )}
        >
          {active ? <span className="size-2 rounded-full bg-white" /> : null}
        </span>
        {label}
      </span>
      <span className="mt-1 block pl-6 text-xs text-muted-foreground">{description}</span>
    </button>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="space-y-1.5 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus-visible:border-ring"
      />
    </label>
  )
}
