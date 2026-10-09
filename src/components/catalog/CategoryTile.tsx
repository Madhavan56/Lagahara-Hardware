import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconChip } from '@/components/ui/icon-chip'
import { getCategoryTile } from '@/config/categoryImages'
import { getCategoryVisual } from '@/lib/categoryVisuals'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/catalog'

// The photo renders at a fixed 112px (128px from `sm`), not the tile width, so
// the browser picks the 480w file instead of downloading the 960w one on phones.
const SIZES = '(min-width: 640px) 128px, 112px'
const FEATURED_SIZES = '(min-width: 1024px) 288px, (min-width: 640px) 128px, 112px'

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
export function CategoryTile({ category, featured = false }: { category: Category; featured?: boolean }) {
  const tile = getCategoryTile(category.slug)
  const visual = getCategoryVisual(category.slug)
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link
      to={`/category/${category.slug}`}
      className={cn(
        'group relative flex h-full min-h-44 flex-col overflow-hidden rounded-card p-5 lg:rounded-[1.75rem] transition-[transform,box-shadow] duration-(--duration-base) ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift active:translate-y-0 active:scale-[0.99]',
        TONE_SURFACE[tile.tone],
      )}
    >
      <IconChip icon={visual.icon} tone={tile.tone} size="sm" className="bg-white/70" />

      <div className={cn('relative z-10 mt-3 max-w-[62%]', featured && 'lg:mt-6 lg:max-w-[55%]')}>
        <h3 className={cn('text-sm leading-tight font-extrabold text-ink-900 sm:text-base', featured && 'lg:text-3xl lg:tracking-tight')}>
          {category.name}
        </h3>
        {category.description ? (
          <p className={cn('mt-1 line-clamp-2 text-xs leading-snug text-ink-700/80', featured && 'lg:mt-3 lg:line-clamp-3 lg:text-sm')}>
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
        {/* On hover-capable devices the arrow slides in on hover; on touch it is always shown. */}
        <ArrowRight className="size-3.5 transition-[transform,opacity] duration-(--duration-base) ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-focus-visible:translate-x-1 [@media(hover:hover)]:-translate-x-1.5 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-x-1 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100" />
      </span>

      {tile.photo && !imageFailed ? (
        <img
          src={tile.photo.src}
          srcSet={tile.photo.srcSet}
          sizes={featured ? FEATURED_SIZES : SIZES}
          alt={tile.photo.alt}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className={cn(
            'pointer-events-none absolute -right-2 -bottom-2 size-28 rounded-card object-cover shadow-card transition-transform duration-(--duration-slow) ease-[var(--ease-fluid)] group-hover:scale-110 sm:size-32',
            featured && 'lg:-right-4 lg:-bottom-4 lg:size-72 lg:rounded-[2rem] lg:group-hover:scale-105',
          )}
        />
      ) : null}
    </Link>
  )
}
