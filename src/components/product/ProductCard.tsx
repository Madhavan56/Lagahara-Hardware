import { motion } from 'framer-motion'
import { Heart, Minus, Plus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/features/cart/store'
import { useIsWishlisted, useWishlistStore } from '@/features/wishlist/store'
import { productImageUrl } from '@/lib/supabase/client'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductListItem } from '@/types/catalog'

export function ProductCard({ product }: { product: ProductListItem }) {
  const imageUrl = productImageUrl(product.primaryImagePath, { width: 400 })
  const outOfStock = product.stockQuantity === 0
  const wishlisted = useIsWishlisted(product.id)
  const toggleWishlist = useWishlistStore((state) => state.toggle)
  const quantityInCart = useCartStore((state) => state.lines[product.id]?.quantity ?? 0)
  const addItem = useCartStore((state) => state.addItem)
  const setQuantity = useCartStore((state) => state.setQuantity)
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

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              toggleWishlist(product.id)
            }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-sand-600 shadow-card backdrop-blur-sm transition-colors hover:text-danger"
          >
            <Heart className={cn('size-4', wishlisted && 'fill-danger text-danger')} />
          </button>

          {!outOfStock ? (
            <div className="absolute right-3 bottom-3 z-10" onClick={(event) => event.preventDefault()}>
              {quantityInCart === 0 ? (
                <button
                  type="button"
                  onClick={() => addItem(product.id, 1, product.stockQuantity)}
                  className="rounded-xl border border-add-500 bg-white px-4 py-1.5 text-xs font-extrabold tracking-wide text-add-600 shadow-lift transition-transform active:scale-95"
                >
                  ADD
                </button>
              ) : (
                <div className="flex items-center overflow-hidden rounded-xl border border-add-500 bg-add-500 text-white shadow-lift">
                  <button
                    type="button"
                    onClick={() => setQuantity(product.id, quantityInCart - 1, product.stockQuantity)}
                    aria-label="Decrease quantity"
                    className="flex h-8 w-7 items-center justify-center transition-colors hover:bg-add-600"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold">{quantityInCart}</span>
                  <button
                    type="button"
                    onClick={() => addItem(product.id, 1, product.stockQuantity)}
                    disabled={quantityInCart >= product.stockQuantity}
                    aria-label="Increase quantity"
                    className="flex h-8 w-7 items-center justify-center transition-colors hover:bg-add-600 disabled:opacity-50"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
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
            <span className="text-base font-extrabold text-sand-900">
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
