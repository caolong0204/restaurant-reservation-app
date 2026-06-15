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
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <span className={cn("flex size-11 items-center justify-center rounded-lg text-sm font-semibold", colorClass)}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-serif text-2xl font-bold text-foreground leading-tight">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}
