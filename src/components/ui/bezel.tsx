import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Double-bezel container (outer shell + inner core), from the
 * high-end-visual-design skill: the content sits like a plate in a machined
 * tray instead of flat on the page. The inner radius is the outer radius
 * minus the shell padding, so the two curves stay concentric.
 *
 *   size="lg"  2rem shell, 0.375rem gap: hero panels, galleries, summaries
 *   size="md"  1.5rem shell, 0.25rem gap: product cards and other grid items
 */
const SIZES = {
  lg: { shell: 'rounded-[2rem] p-1.5', core: 'rounded-[calc(2rem-0.375rem)]' },
  md: { shell: 'rounded-[1.5rem] p-1', core: 'rounded-[calc(1.5rem-0.25rem)]' },
} as const

export function Bezel({
  children,
  size = 'lg',
  className,
  coreClassName,
}: {
  children: ReactNode
  size?: keyof typeof SIZES
  /** Extra classes for the outer shell (layout, spacing). */
  className?: string
  /** Extra classes for the inner core (background, padding, overflow). */
  coreClassName?: string
}) {
  return (
    <div className={cn('bg-ink-950/[0.03] ring-1 ring-ink-950/[0.06]', SIZES[size].shell, className)}>
      <div
        className={cn(
          'h-full overflow-hidden bg-card shadow-[inset_0_1px_1px_rgb(255_255_255/0.7),0_1px_2px_rgb(60_39_130/0.04),0_12px_32px_-12px_rgb(60_39_130/0.12)]',
          SIZES[size].core,
          coreClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
