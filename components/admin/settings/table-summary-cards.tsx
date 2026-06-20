import { SUMMARY_CARDS, type TableCounts } from './table-settings-shared'

export function TableSummaryCards({ counts }: { counts: TableCounts }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {SUMMARY_CARDS.map(([label, key, Icon]) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-xs"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-flambe-rust">
            <Icon className="size-4" />
          </span>
          <div>
            <p className="text-2xl font-bold leading-none text-foreground">{counts[key]}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
