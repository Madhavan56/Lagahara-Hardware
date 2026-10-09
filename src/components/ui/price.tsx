import { cn, formatPrice } from '@/lib/utils'

/**
 * Price with its struck-through compare-at value and optional unit suffix.
 * Centralised so the strikethrough rule (only shown when it is genuinely
 * higher than the live price) can't be got wrong per-page.
 */
export function Price({
  value,
  compareAt,
  unitLabel,
  size = 'md',
  className,
}: {
  value: number
  compareAt?: number | null
  unitLabel?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const showCompare = compareAt != null && compareAt > value

  return (
    <span className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums', className)}>
      <span
        className={cn(
          'font-extrabold text-content',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-2xl',
        )}
      >
        {formatPrice(value)}
      </span>
      {showCompare ? (
        <span
          className={cn(
            'text-content-subtle line-through',
            size === 'lg' ? 'text-sm' : 'text-xs',
          )}
        >
          {formatPrice(compareAt)}
        </span>
      ) : null}
      {unitLabel ? (
        <span className={cn('text-content-muted', size === 'lg' ? 'text-sm' : 'text-[0.6875rem]')}>
          / {unitLabel}
        </span>
      ) : null}
    </span>
  )
}
