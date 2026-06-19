import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  colorClass?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  colorClass = 'text-primary bg-primary/10',
}: StatCardProps) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-lg border border-border/80 bg-card px-4 py-3 shadow-xs">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold", colorClass)}>
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-2xl font-bold leading-none tabular-nums text-foreground">
          {value}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
