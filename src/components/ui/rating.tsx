import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Amber stars with the review count in parentheses, as in the references.
 * Half-steps are rendered by clipping a filled row over an empty one, which
 * keeps it to two elements and no per-star branching.
 */
export function Rating({
  value,
  count,
  size = 'md',
  showCount = true,
  className,
}: {
  value: number
  count?: number
  size?: 'sm' | 'md'
  showCount?: boolean
  className?: string
}) {
  const clamped = Math.max(0, Math.min(5, value))
  const starClass = size === 'sm' ? 'size-3' : 'size-3.5'
  const label = count
    ? `Rated ${clamped.toFixed(1)} out of 5 from ${count} ${count === 1 ? 'review' : 'reviews'}`
    : `Rated ${clamped.toFixed(1)} out of 5`

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} title={label}>
      <span className="relative inline-flex" role="img" aria-label={label}>
        <span className="inline-flex gap-0.5" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className={cn(starClass, 'text-star-empty')} fill="currentColor" />
          ))}
        </span>
        <span
          className="absolute inset-0 inline-flex gap-0.5 overflow-hidden"
          style={{ width: `${(clamped / 5) * 100}%` }}
          aria-hidden
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={cn(starClass, 'shrink-0 text-star')}
              fill="currentColor"
            />
          ))}
        </span>
      </span>
      {showCount && count !== undefined ? (
        <span
          className={cn('font-semibold text-content-muted', size === 'sm' ? 'text-[0.6875rem]' : 'text-xs')}
        >
          ({count})
        </span>
      ) : null}
    </span>
  )
}
