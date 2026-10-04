import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryTile } from '@/config/categoryImages'
import { useCategories } from '@/features/catalog/queries'
import { cn } from '@/lib/utils'

/**
 * Always-visible category rail: one tap to any category from anywhere on the
 * page. Horizontally scrollable with hidden scrollbars.
 */
export function CategoryRail() {
  const { data: categories = [] } = useCategories()
  const [failedSlugs, setFailedSlugs] = useState<Set<string>>(() => new Set())

  function markFailed(slug: string) {
    setFailedSlugs((prev) => {
      if (prev.has(slug)) return prev
      const next = new Set(prev)
      next.add(slug)
      return next
    })
  }

  return (
    <nav aria-label="Shop categories" className="border-b border-border-subtle bg-card">
      <div className="container-page flex gap-4 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const tile = getCategoryTile(category.slug)
          const imageFailed = failedSlugs.has(category.slug)
          return (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group flex w-18 shrink-0 snap-start flex-col items-center gap-1.5"
              title={category.name}
            >
              <span className="block size-14 overflow-hidden rounded-pill bg-surface-sunken ring-2 ring-transparent transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-card group-hover:ring-iris-200">
                {tile.photo && !imageFailed ? (
                  <img
                    src={tile.photo.src}
                    srcSet={tile.photo.srcSet}
                    sizes="56px"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={() => markFailed(category.slug)}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className={cn('flex size-full items-center justify-center', tile.fallbackTint)} />
                )}
              </span>
              <span className="w-full truncate text-center text-[0.6875rem] leading-tight font-semibold text-ink-600 transition-colors group-hover:text-primary">
                {category.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
