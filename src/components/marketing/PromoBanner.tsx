import { Link } from 'react-router-dom'
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
    <div
      className={cn(
        'focus-ring-light relative flex flex-col items-center gap-5 overflow-hidden rounded-panel px-6 py-8 text-center sm:flex-row sm:gap-8 sm:px-10 sm:text-left',
        gradient === 'promo' ? 'bg-gradient-promo' : 'bg-gradient-brand',
        className,
      )}
    >
      {/* Soft light bloom, echoing the reference banners. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 20%, rgb(255 255 255 / 0.22), transparent 45%), radial-gradient(circle at 88% 90%, rgb(255 255 255 / 0.14), transparent 50%)',
        }}
      />

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
        className="relative inline-flex h-11 shrink-0 items-center rounded-pill bg-card px-6 text-sm font-bold text-primary shadow-card transition-colors hover:bg-iris-50"
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
