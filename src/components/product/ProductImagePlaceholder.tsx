import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Branded empty state for a product with no uploaded photo yet — never a broken-image icon. */
export function ProductImagePlaceholder({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const iconSize = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-10' : 'size-6'
  const showLabel = size !== 'sm'

  return (
    <div
      className={cn(
        'flex size-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-sand-100 to-sand-200 text-sand-400',
        className,
      )}
    >
      <ImageOff className={iconSize} />
      {showLabel ? <span className="text-[0.6875rem] font-medium text-sand-400">Photo coming soon</span> : null}
    </div>
  )
}
