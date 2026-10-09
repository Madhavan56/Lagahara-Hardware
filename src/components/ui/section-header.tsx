import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/motion/reveal'

type SectionHeaderProps = {
  title: string
  /** Small uppercase line above the title. */
  eyebrow?: string
  subtitle?: string
  /** Where the trailing action points. Omit for a header with no action. */
  actionTo?: string
  actionLabel?: string
  /**
   * `link` is the violet text link; `pill` is the light rounded button. Both
   * appear in the reference designs — pick per section density.
   */
  actionVariant?: 'link' | 'pill'
  children?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  eyebrow,
  subtitle,
  actionTo,
  actionLabel = 'View all',
  actionVariant = 'link',
  children,
  className,
}: SectionHeaderProps) {
  return (
    <Reveal className={cn('mb-5 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-label text-primary uppercase">{eyebrow}</p> : null}
        <h2 className={cn('text-h2 text-content', eyebrow && 'mt-1')}>{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-content-muted">{subtitle}</p> : null}
      </div>

      {children}

      {actionTo ? (
        <Link
          to={actionTo}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 font-bold whitespace-nowrap transition-colors',
            actionVariant === 'pill'
              ? 'rounded-pill bg-surface-sunken px-4 py-2 text-sm text-ink-700 hover:bg-ink-200 hover:text-content'
              : 'text-sm text-primary hover:text-primary-hover',
          )}
        >
          {actionLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </Reveal>
  )
}
