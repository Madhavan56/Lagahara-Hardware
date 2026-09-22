import { motion } from 'framer-motion'
import { Heart, Minus, Plus, Star, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/features/cart/store'
import { useIsWishlisted, useWishlistStore } from '@/features/wishlist/store'
import { productImageUrl } from '@/lib/supabase/client'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductListItem } from '@/types/catalog'

const LOW_STOCK_THRESHOLD = 5

export function ProductCard({ product }: { product: ProductListItem }) {
  const imageUrl = productImageUrl(product.primaryImagePath, { width: 400 })
  const outOfStock = product.stockQuantity === 0
  const lowStock = !outOfStock && product.stockQuantity <= LOW_STOCK_THRESHOLD
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
            <ProductImagePlaceholder size="md" />
          )}

          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
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
            <div className="absolute inset-x-3 bottom-3 z-10" onClick={(event) => event.preventDefault()}>
              {quantityInCart === 0 ? (
                <button
                  type="button"
                  onClick={() => addItem(product.id, 1, product.stockQuantity)}
                  className="w-full rounded-xl border border-add-500 bg-white/95 px-4 py-2 text-xs font-extrabold tracking-widest text-add-600 shadow-lift backdrop-blur-sm transition-all hover:bg-add-50 active:scale-95"
                >
                  ADD
                </button>
              ) : (
                <div className="flex items-stretch overflow-hidden rounded-xl border border-add-500 bg-add-500 text-white shadow-lift">
                  <button
                    type="button"
                    onClick={() => setQuantity(product.id, quantityInCart - 1, product.stockQuantity)}
                    aria-label="Decrease quantity"
                    className="flex h-9 flex-1 items-center justify-center transition-colors hover:bg-add-600"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="flex w-8 items-center justify-center text-sm font-bold">
                    {quantityInCart}
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem(product.id, 1, product.stockQuantity)}
                    disabled={quantityInCart >= product.stockQuantity}
                    aria-label="Increase quantity"
                    className="flex h-9 flex-1 items-center justify-center transition-colors hover:bg-add-600 disabled:opacity-50"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-center justify-between gap-2">
            {product.brand ? (
              <p className="truncate text-[0.6875rem] font-bold tracking-widest text-sand-500 uppercase">
                {product.brand}
              </p>
            ) : (
              <span />
            )}
            {product.ratingCount > 0 ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-sand-100 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-sand-700">
                <Star className="size-3 fill-brand-600 text-brand-600" />
                {product.ratingAvg.toFixed(1)}
              </span>
            ) : null}
          </div>

          <h3 className="line-clamp-2 min-h-10 text-sm leading-snug font-semibold text-sand-900">
            {product.name}
          </h3>

          <div className="mt-auto flex items-baseline gap-2 pt-1.5">
            <span className="text-base font-extrabold text-sand-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-xs text-sand-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
            <span className="text-[0.6875rem] text-sand-500">/ {product.unitLabel}</span>
          </div>

          <div className="flex min-h-4 items-center gap-1 text-[0.6875rem] font-semibold">
            {lowStock ? (
              <span className="text-danger">
                Only {product.stockQuantity} left
              </span>
            ) : (
              <>
                <Zap className="size-3 fill-brass-500 text-brass-500" aria-hidden />
                <span className="text-brand-700">Quick delivery · 2 days</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
