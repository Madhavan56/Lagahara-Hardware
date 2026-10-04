import type { LucideIcon } from 'lucide-react'
import { IconChip } from '@/components/ui/icon-chip'
import { cn } from '@/lib/utils'

export type TrustItem = {
  icon: LucideIcon
  title: string
  detail: string
  tone?: 'lavender' | 'sky' | 'mint' | 'peach' | 'primary'
}

/**
 * The reassurance row: pastel icon chip, bold claim, muted detail. Claims are
 * passed in by the page so nothing here asserts a promise the site can't keep.
 */
export function TrustStrip({
  items,
  className,
  variant = 'plain',
}: {
  items: TrustItem[]
  className?: string
  /** `panel` wraps the row in a soft lavender surface, as in the references. */
  variant?: 'plain' | 'panel'
}) {
  return (
    <ul
      className={cn(
        'grid gap-5 sm:grid-cols-2 lg:grid-cols-4',
        variant === 'panel' && 'rounded-panel bg-primary-soft p-6 sm:p-8',
        items.length === 3 && 'lg:grid-cols-3',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-3">
          <IconChip icon={item.icon} tone={item.tone ?? 'lavender'} shape="circle" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-content">{item.title}</p>
            <p className="mt-0.5 text-sm leading-snug text-content-muted">{item.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
