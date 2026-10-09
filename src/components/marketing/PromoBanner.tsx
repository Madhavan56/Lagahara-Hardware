import { Link } from 'react-router-dom'
import { IslandIcon } from '@/components/ui/island-icon'
import { cn } from '@/lib/utils'

/**
 * Full-width gradient banner with a circular badge on the left and a white
 * pill CTA on the right. `focus-ring-light` is set on the panel so focus rings
 * inside it stay visible against the gradient.
 */
export function PromoBanner({
  badgeLines,
  title,
  subtitle,
  ctaLabel,
  ctaTo,
  gradient = 'promo',
  className,
}: {
  /** Two short lines stacked inside the circle, e.g. ['Limited', 'Offer']. */
  badgeLines: [string, string]
  title: string
  subtitle?: string
  ctaLabel: string
  ctaTo: string
  gradient?: 'promo' | 'brand'
  className?: string
}) {
  return (
    // Double-bezel: hairline tray around the gradient plate.
    <div className={cn('rounded-[2rem] bg-ink-950/[0.03] p-1.5 ring-1 ring-ink-950/[0.06]', className)}>
    <div
      className={cn(
        'focus-ring-light relative flex flex-col items-center gap-5 overflow-hidden rounded-[calc(2rem-0.375rem)] px-6 py-10 text-center shadow-[inset_0_1px_1px_rgb(255_255_255/0.2)] sm:flex-row sm:gap-8 sm:px-12 sm:text-left',
        gradient === 'promo' ? 'bg-gradient-promo' : 'bg-gradient-brand',
      )}
    >
      <span className="relative flex size-20 shrink-0 flex-col items-center justify-center rounded-pill bg-card text-center leading-tight shadow-card">
        <span className="text-[0.6875rem] font-bold text-content-muted">{badgeLines[0]}</span>
        <span className="text-sm font-extrabold text-primary">{badgeLines[1]}</span>
      </span>

      <div className="relative min-w-0 flex-1">
        <p className="text-h3 text-white sm:text-h2">{title}</p>
        {subtitle ? <p className="mt-1.5 text-sm text-white/80">{subtitle}</p> : null}
      </div>

      <Link
        to={ctaTo}
        className="group relative inline-flex h-12 shrink-0 items-center gap-3 rounded-pill bg-card pr-1.5 pl-6 text-sm font-bold text-primary shadow-card transition-[background-color,transform] duration-(--duration-base) ease-[var(--ease-fluid)] hover:bg-iris-50 active:scale-[0.98]"
      >
        {ctaLabel}
        <IslandIcon tone="dark" className="bg-primary text-on-primary" />
      </Link>
    </div>
    </div>
  )
}
