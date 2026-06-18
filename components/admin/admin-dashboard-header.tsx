import { CalendarClock, LogOut, Plus, RefreshCcw, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { signOutAdmin } from '@/lib/auth-actions'
import { RESTAURANT } from '@/lib/restaurant'
import { cn } from '@/lib/utils'
import type { AdminView } from '@/lib/hooks/use-admin-reservation-filters'

type AdminDashboardHeaderProps = {
  view: AdminView
  onViewChange: (view: AdminView) => void
  isLoading: boolean
  onRefresh: () => void
  onOpenCreate: () => void
}

export function AdminDashboardHeader({
  view,
  onViewChange,
  isLoading,
  onRefresh,
  onOpenCreate,
}: AdminDashboardHeaderProps) {
  return (
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
              Trang quản trị nhân viên · Supabase
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
  )
}
