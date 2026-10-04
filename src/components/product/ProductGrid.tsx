import { motion } from 'framer-motion'
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
      <Card size="lg" className="text-sm text-content-muted">
        No products found.
      </Card>
    )
  }

  return (
    <motion.div
      initial="hidden"
      // Fade in as the row scrolls into view rather than on mount, so grids
      // below the fold don't animate while off screen. MotionConfig's
      // reducedMotion="user" still disables this entirely when requested.
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      className={cn(gridClass, 'transition-opacity duration-200', isFetching && 'pointer-events-none opacity-40')}
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  )
}
