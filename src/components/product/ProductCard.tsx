import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { productImageUrl } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { ProductListItem } from '@/types/catalog'

export function ProductCard({ product }: { product: ProductListItem }) {
  const imageUrl = productImageUrl(product.primaryImagePath)
  const outOfStock = product.stockQuantity === 0
  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
      <Link
        to={`/product/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-sand-200 bg-white shadow-card transition-shadow duration-300 hover:shadow-lift"
      >
        <div className="relative aspect-square overflow-hidden bg-sand-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-sand-400">
              No image
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPct ? (
              <Badge variant="accent" size="sm">
                {discountPct}% off
              </Badge>
            ) : null}
            {outOfStock ? (
              <Badge variant="danger" size="sm">
                Out of stock
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          {product.brand ? (
            <p className="text-xs font-semibold tracking-wide text-sand-500 uppercase">
              {product.brand}
            </p>
          ) : null}
          <h3 className="line-clamp-2 text-sm leading-snug font-medium text-sand-900">
            {product.name}
          </h3>

          {product.ratingCount > 0 ? (
            <div className="flex items-center gap-1 text-xs text-sand-500">
              <Star className="size-3.5 fill-brass-500 text-brass-500" />
              <span>{product.ratingAvg.toFixed(1)}</span>
              <span>({product.ratingCount})</span>
            </div>
          ) : null}

          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="text-base font-semibold text-sand-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-sm text-sand-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
            <span className="text-xs text-sand-500">/ {product.unitLabel}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
