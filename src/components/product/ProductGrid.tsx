import { PackageSearch } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StaggerList } from '@/components/motion/stagger-list'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ProductListItem } from '@/types/catalog'
import { ProductCard } from './ProductCard'

export function ProductGrid({
  products,
  isLoading,
  isError,
  isFetching,
  skeletonCount = 8,
  compact = false,
}: {
  products: ProductListItem[] | undefined
  isLoading?: boolean
  isError?: boolean
  /** A new page is loading (previous kept via keepPreviousData) — dim, don't blank. */
  isFetching?: boolean
  skeletonCount?: number
  /** Denser browsing grid for large catalog sweeps. */
  compact?: boolean
}) {
  const gridClass = cn(
    'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4',
    compact && 'sm:grid-cols-4 lg:grid-cols-5',
  )

  if (isError) {
    return (
      <Card size="lg" className="text-sm text-content-muted">
        Products could not be loaded.
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="aspect-[3/4] rounded-card" />
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <Card size="lg" variant="soft" className="flex flex-col items-center py-12 text-center">
        <PackageSearch className="size-10 text-primary" aria-hidden />
        <p className="mt-4 text-h3 text-content">Nothing matches yet</p>
        <p className="mt-1 max-w-sm text-sm text-content-muted">
          Try removing a filter or searching for a different term. You can also browse the full catalogue.
        </p>
        <Link to="/shop" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-5')}>
          Shop all
        </Link>
      </Card>
    )
  }

  return (
    <div className={cn('transition-opacity duration-(--duration-fast)', isFetching && 'pointer-events-none opacity-40')}>
      {/* Replays the staggered fade whenever the set of products changes (filters, sort, page). */}
      <StaggerList
        items={products}
        getKey={(product) => product.id}
        replayKey={products.map((product) => product.id).join(',')}
        className={gridClass}
        renderItem={(product) => <ProductCard product={product} />}
      />
    </div>
  )
}
