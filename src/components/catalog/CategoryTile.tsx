import { Link } from 'react-router-dom'
import { getCategoryTile } from '@/config/categoryImages'
import { getCategoryVisual } from '@/lib/categoryVisuals'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/catalog'

const SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'

export function CategoryTile({ category }: { category: Category }) {
  const tile = getCategoryTile(category.slug)
  const visual = getCategoryVisual(category.slug)

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-card shadow-card transition-shadow duration-300 hover:shadow-lift"
    >
      {tile.photo ? (
        <img
          src={tile.photo.src}
          srcSet={tile.photo.srcSet}
          sizes={SIZES}
          alt={tile.photo.alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={cn('flex size-full items-center justify-center bg-gradient-to-br', tile.fallbackGradient)}>
          <visual.icon className="size-12 text-white/25" />
        </div>
      )}

      {/* Scrim keeps the label legible over any photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-sand-950/85 via-sand-950/25 to-transparent" />

      <span className="absolute inset-x-0 bottom-0 p-3 text-sm leading-tight font-bold text-white sm:p-4 sm:text-base">
        {category.name}
      </span>
    </Link>
  )
}
