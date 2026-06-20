import {
  CalendarClock,
  Home,
  ListChecks,
  LogOut,
  Settings2,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { signOutAdmin } from '@/lib/auth-actions'
import type { AdminView } from '@/lib/hooks/use-admin-reservation-filters'
import { RESTAURANT } from '@/lib/restaurant'
import { cn } from '@/lib/utils'

function AdminNavButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors',
        active
          ? 'bg-flambe-rust/10 text-flambe-rust shadow-xs'
          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-md',
          active ? 'bg-flambe-rust/10 text-flambe-rust' : 'bg-background text-muted-foreground',
        )}
      >
        <Icon className="size-4" />
      </span>
      {label}
    </button>
  )
}

export function AdminSidebar({
  view,
  canManageSettings,
  onViewChange,
}: {
  view: AdminView
  canManageSettings: boolean
  onViewChange: (view: AdminView) => void
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/80 bg-background px-4 py-4 lg:flex">
      <div className="px-2 py-2">
        <Image
          src="/flambe-logo.png"
          alt={RESTAURANT.name}
          width={764}
          height={326}
          priority
          className="h-auto w-32 object-contain"
        />
        <button
          type="button"
          className="mt-5 flex h-12 w-full items-center justify-between rounded-lg border border-border bg-card px-3 text-sm font-bold text-foreground"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-flambe-gold/15 text-flambe-gold">
              <UsersRound className="size-4" />
            </span>
            Admin
          </span>
          <ShieldCheck className="size-4 text-flambe-gold" />
        </button>
      </div>

      <nav className="mt-5 flex flex-col gap-1.5">
        <AdminNavButton
          active={view === 'reservations'}
          icon={ListChecks}
          label="Danh sách"
          onClick={() => onViewChange('reservations')}
        />
        <AdminNavButton
          active={view === 'calendar'}
          icon={CalendarClock}
          label="Lịch ngày"
          onClick={() => onViewChange('calendar')}
        />
        {canManageSettings && (
          <>
            <AdminNavButton
              active={view === 'settings'}
              icon={Settings2}
              label="Cài đặt"
              onClick={() => onViewChange('settings')}
            />
            <AdminNavButton
              active={view === 'accounts'}
              icon={UsersRound}
              label="Tài khoản"
              onClick={() => onViewChange('accounts')}
            />
          </>
        )}
      </nav>

      <div className="mt-auto space-y-1.5 border-t border-border/70 pt-4">
        <Link
          href="/"
          className="inline-flex h-7 w-full items-center justify-start gap-2 rounded-lg px-2.5 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Home className="size-4" />
          Trang chủ
        </Link>
        <form action={signOutAdmin}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-lg text-muted-foreground"
          >
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </form>
      </div>
    </aside>
  )
}

export function AdminMobileNav({
  view,
  canManageSettings,
  onViewChange,
}: {
  view: AdminView
  canManageSettings: boolean
  onViewChange: (view: AdminView) => void
}) {
  return (
    <div className="border-b border-border/80 bg-background px-3 py-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Image
          src="/flambe-logo.png"
          alt={RESTAURANT.name}
          width={764}
          height={326}
          priority
          className="h-auto w-32 object-contain"
        />
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          <AdminMobileNavButton
            active={view === 'reservations'}
            label="Danh sách"
            onClick={() => onViewChange('reservations')}
          />
          <AdminMobileNavButton
            active={view === 'calendar'}
            label="Lịch ngày"
            onClick={() => onViewChange('calendar')}
          />
          {canManageSettings && (
            <>
              <AdminMobileNavButton
                active={view === 'settings'}
                label="Cài đặt"
                onClick={() => onViewChange('settings')}
              />
              <AdminMobileNavButton
                active={view === 'accounts'}
                label="Tài khoản"
                onClick={() => onViewChange('accounts')}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function AdminMobileNavButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-2.5 py-1.5 text-xs font-bold',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
      )}
    >
      {label}
    </button>
  )
}
