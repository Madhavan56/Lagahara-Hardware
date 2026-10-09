import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * "Button-in-button" trailing icon: the arrow sits in its own circle, flush
 * with the button's inner padding, and nudges diagonally on the parent's
 * hover. Put it inside an element with the `group` class and trim that
 * element's right padding so the circle sits flush (e.g. `pr-1.5`).
 */
export function IslandIcon({
  icon: Icon = ArrowUpRight,
  tone = 'light',
  className,
}: {
  icon?: LucideIcon
  /** `light` for filled (dark) buttons, `dark` for light or outline buttons. */
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-pill transition-transform duration-(--duration-slow) ease-[var(--ease-fluid)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105',
        tone === 'light' ? 'bg-white/15' : 'bg-ink-950/[0.06]',
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  )
}
