'use client'

import { useState, useTransition } from 'react'
import { Lock, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { changeCurrentStaffPassword } from '@/lib/admin-account-actions'

export function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const save = () => {
    startTransition(async () => {
      const result = await changeCurrentStaffPassword({ currentPassword, newPassword })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setIsEditing(false)
      toast.success('Đã đổi mật khẩu')
    })
  }

  return (
    <section className="max-w-[470px] rounded-lg border border-border bg-card p-5 shadow-xs">
      <div className="flex gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-flambe-gold/15 text-flambe-rust">
          <Lock className="size-6" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-foreground">Mật khẩu của tôi</h2>
          <p className="mt-1 text-sm text-muted-foreground">Đổi mật khẩu tài khoản đang đăng nhập.</p>
        </div>
      </div>
      
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-flambe-rust bg-background px-5 text-sm font-bold text-flambe-rust hover:bg-flambe-rust/5"
      >
        Đổi mật khẩu
      </button>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[400px] rounded-lg border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Lock className="size-5 text-flambe-rust" />
                <h2 className="font-serif text-xl font-bold text-foreground">Đổi mật khẩu</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="mt-5 grid gap-4">
              <label className="space-y-1.5 text-sm font-semibold text-foreground">
                <span>Mật khẩu hiện tại</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus-visible:border-ring"
                />
              </label>
              <label className="space-y-1.5 text-sm font-semibold text-foreground">
                <span>Mật khẩu mới</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus-visible:border-ring"
                />
              </label>
              <div className="mt-2 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isPending}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-flambe-rust px-5 text-sm font-bold text-white hover:bg-flambe-rust-hover disabled:opacity-60"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
