import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconChip } from '@/components/ui/icon-chip'
import { getCategoryTile } from '@/config/categoryImages'
import { getCategoryVisual } from '@/lib/categoryVisuals'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/catalog'

const SIZES = '(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw'

const TONE_SURFACE = {
  lavender: 'bg-pastel-lavender',
  sky: 'bg-pastel-sky',
  mint: 'bg-pastel-mint',
  peach: 'bg-pastel-peach',
} as const

const TONE_INK = {
  lavender: 'text-pastel-lavender-ink',
  sky: 'text-pastel-sky-ink',
  mint: 'text-pastel-mint-ink',
  peach: 'text-pastel-peach-ink',
} as const

/**
 * Pastel category card: name, short subtitle, a "Shop Now →" link in the
 * card's own hue, and the real category photograph bleeding out of the
 * bottom-right corner.
 */
export function CategoryTile({ category }: { category: Category }) {
  const tile = getCategoryTile(category.slug)
  const visual = getCategoryVisual(category.slug)
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link
      to={`/category/${category.slug}`}
      className={cn(
        'group relative flex h-full min-h-44 flex-col overflow-hidden rounded-card p-5 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift',
        TONE_SURFACE[tile.tone],
      )}
    >
      <IconChip icon={visual.icon} tone={tile.tone} size="sm" className="bg-white/70" />

      <div className="relative z-10 mt-3 max-w-[62%]">
        <h3 className="text-sm leading-tight font-extrabold text-ink-900 sm:text-base">
          {category.name}
        </h3>
        {category.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-ink-700/80">
            {category.description}
          </p>
        ) : null}
      </div>

      <span
        className={cn(
          'relative z-10 mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold',
          TONE_INK[tile.tone],
        )}
      >
        Shop Now
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </span>

      {tile.photo && !imageFailed ? (
        <img
          src={tile.photo.src}
          srcSet={tile.photo.srcSet}
          sizes={SIZES}
          alt={tile.photo.alt}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="pointer-events-none absolute -right-2 -bottom-2 size-28 rounded-card object-cover shadow-card transition-transform duration-500 group-hover:scale-105 sm:size-32"
        />
      ) : null}
    </Link>
  )
}
