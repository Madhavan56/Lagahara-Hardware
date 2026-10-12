import { m, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'
import type { OrderStatus } from '@/types/order'

/*
  Order lifecycle as one stacked bar. In-flight stages step one hue light →
  dark (it's a progression); the two end states use the reserved status
  colours. Every segment is also named with its count in the list below, so
  identity never rests on colour alone.
*/
const STAGES: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Awaiting payment', color: 'var(--color-ink-300)' },
  { status: 'confirmed', label: 'Confirmed', color: 'var(--color-iris-300)' },
  { status: 'processing', label: 'Processing', color: 'var(--color-iris-500)' },
  { status: 'shipped', label: 'Shipped', color: 'var(--color-iris-700)' },
  { status: 'out_for_delivery', label: 'Out for delivery', color: 'var(--color-iris-900)' },
  { status: 'delivered', label: 'Delivered', color: 'var(--color-success)' },
  { status: 'cancelled', label: 'Cancelled', color: 'var(--color-danger)' },
]

export function StatusBreakdown({ counts }: { counts: Record<OrderStatus, number> }) {
  const reduce = useReducedMotion()
  const total = STAGES.reduce((sum, s) => sum + counts[s.status], 0)
  const visible = STAGES.filter((s) => counts[s.status] > 0)

  if (total === 0) {
    return <p className="text-sm text-content-muted">No orders yet.</p>
  }

  return (
    <div>
      {/* 2px surface gaps separate the segments. */}
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-pill" role="img" aria-label="Orders by status">
        {visible.map((stage, i) => (
          <m.span
            key={stage.status}
            className="h-full origin-left first:rounded-l-pill last:rounded-r-pill"
            style={{ backgroundColor: stage.color, flexGrow: counts[stage.status], flexBasis: 0 }}
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.2 + i * 0.06, ease: EASE.expo }}
          />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {STAGES.map((stage) => (
          <li key={stage.status} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-ink-700">
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: stage.color }} aria-hidden />
              <span className="truncate">{stage.label}</span>
            </span>
            <span className="font-semibold text-content tabular-nums">{counts[stage.status]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
