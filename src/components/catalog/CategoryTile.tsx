import { Link } from 'react-router-dom'
import { getCategoryTile } from '@/config/categoryImages'
import { getCategoryVisual } from '@/lib/categoryVisuals'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/catalog'

const SIZES = '(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw'

export function CategoryTile({ category }: { category: Category }) {
  const tile = getCategoryTile(category.slug)
  const visual = getCategoryVisual(category.slug)

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative block aspect-square overflow-hidden rounded-card border border-sand-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
    >
      {tile.photo ? (
        <img
          src={tile.photo.src}
          srcSet={tile.photo.srcSet}
          sizes={SIZES}
          alt={tile.photo.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={cn('absolute inset-0 flex items-center justify-center bg-gradient-to-br', tile.fallbackGradient)}>
          <visual.icon className="size-10 text-white/25" />
        </div>
      )}

      {/* Scrim keeps the label legible over any photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-sand-950/85 via-sand-950/10 to-transparent" />

      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
        <span className="line-clamp-2 text-xs leading-tight font-bold text-white sm:text-sm">
          {category.name}
        </span>
        <span className="flex size-6 shrink-0 translate-y-1 items-center justify-center rounded-full bg-white/15 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <svg viewBox="0 0 16 16" fill="none" className="size-3 text-white" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </Link>
  )
}
