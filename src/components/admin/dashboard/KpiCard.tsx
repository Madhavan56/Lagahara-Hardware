import { m } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/lib/utils'

export type KpiDelta = { current: number; previous: number; label: string }

function DeltaPill({ delta }: { delta: KpiDelta }) {
  const diff = delta.current - delta.previous
  const pct = delta.previous === 0 ? null : Math.round((diff / delta.previous) * 100)
  const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus
  const text =
    diff === 0 ? `Same as ${delta.label}` : pct === null ? `New vs ${delta.label}` : `${Math.abs(pct)}% vs ${delta.label}`
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold',
        diff > 0 ? 'bg-success-surface text-success' : diff < 0 ? 'bg-danger-surface text-danger' : 'bg-surface-sunken text-ink-600',
      )}
    >
      <Icon className="size-3" aria-hidden />
      {text}
    </span>
  )
}

/** Headline number card: icon chip, count-up value, optional change vs a previous period. */
export function KpiCard({
  icon: Icon,
  label,
  value,
  format,
  hint,
  delta,
  to,
  tone = 'brand',
}: {
  icon: LucideIcon
  label: string
  value: number | undefined
  format?: (n: number) => string
  hint?: string
  delta?: KpiDelta
  to: string
  tone?: 'brand' | 'warning'
}) {
  return (
    <m.div variants={fadeUp} className="h-full">
      <Link
        to={to}
        className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border-subtle bg-card p-5 shadow-xs transition-[box-shadow,transform,border-color] duration-(--duration-base) ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-iris-200 hover:shadow-lift"
      >
        {/* Soft corner glow that brightens on hover. */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-60 blur-2xl transition-opacity duration-(--duration-slow) group-hover:opacity-100',
            tone === 'warning' ? 'bg-warning-surface' : 'bg-iris-100',
          )}
        />
        <div className="relative flex items-center justify-between">
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-pill',
              tone === 'warning' ? 'bg-warning-surface text-warning' : 'bg-primary-soft text-primary',
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <ArrowUpRight
            className="size-4 -translate-x-1 translate-y-1 text-content-subtle opacity-0 transition-[transform,opacity] duration-(--duration-base) group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
            aria-hidden
          />
        </div>
        <p className="relative mt-4 text-[1.75rem] leading-none font-bold tracking-tight text-content tabular-nums">
          {value === undefined ? (
            <span className="inline-block h-7 w-20 animate-pulse rounded-sm bg-surface-sunken align-middle" />
          ) : (
            <AnimatedNumber value={value} from={0} format={format} />
          )}
        </p>
        <p className="relative mt-1.5 text-sm font-medium text-content-muted">{label}</p>
        <div className="relative mt-auto pt-3">
          {delta && value !== undefined ? <DeltaPill delta={delta} /> : hint ? <p className="text-xs text-content-subtle">{hint}</p> : null}
        </div>
      </Link>
    </m.div>
  )
}
