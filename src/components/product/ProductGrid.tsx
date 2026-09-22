import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductListItem } from '@/types/catalog'
import { ProductCard } from './ProductCard'

export function ProductGrid({
  products,
  isLoading,
  isError,
  skeletonCount = 8,
}: {
  products: ProductListItem[] | undefined
  isLoading?: boolean
  isError?: boolean
  skeletonCount?: number
}) {
  if (isError) {
    return (
      <p className="rounded-panel border border-sand-200 bg-white p-6 text-sm text-sand-600">
        Products could not be loaded.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="aspect-[3/4] rounded-card" />
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <p className="rounded-panel border border-sand-200 bg-white p-6 text-sm text-sand-600">
        No products found.
      </p>
    )
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
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
