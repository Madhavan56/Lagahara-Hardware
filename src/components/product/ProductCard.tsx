import { motion } from 'framer-motion'
import { Check, Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { Price } from '@/components/ui/price'
import { Rating } from '@/components/ui/rating'
import { StatusPill, deriveProductStatus } from '@/components/ui/status-pill'
import { useCartStore } from '@/features/cart/store'
import { useCategoryNameMap } from '@/features/catalog/queries'
import { useIsWishlisted, useWishlistStore } from '@/features/wishlist/store'
import { productImageUrl } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
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
  const categoryNames = useCategoryNameMap()
  const categoryName = categoryNames.get(product.categoryId)
  const status = deriveProductStatus(product)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link
        to={`/product/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-card bg-card shadow-card transition-shadow duration-300 hover:shadow-lift"
      >
        {/* Light-grey image tile with the product centred. */}
        <div className="relative aspect-square overflow-hidden bg-surface-sunken">
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

          {status ? (
            <StatusPill tone={status.tone} className="absolute top-3 left-3">
              {status.label}
            </StatusPill>
          ) : null}

          <motion.button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              toggleWishlist(product.id)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-pill bg-card/90 text-ink-600 shadow-xs backdrop-blur-sm transition-colors hover:text-pill-best"
          >
            <Heart className={cn('size-4', wishlisted && 'fill-pill-best text-pill-best')} />
          </motion.button>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          {categoryName ? (
            <p className="text-label truncate text-content-muted uppercase">{categoryName}</p>
          ) : null}

          <h3 className="line-clamp-2 min-h-10 text-sm leading-snug font-bold text-content transition-colors duration-300 group-hover:text-primary">
            {product.name}
          </h3>

          {product.ratingCount > 0 ? (
            <Rating value={product.ratingAvg} count={product.ratingCount} size="sm" />
          ) : (
            <span className="text-[0.6875rem] text-content-subtle">No reviews yet</span>
          )}

          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <Price
              value={product.price}
              compareAt={product.compareAtPrice}
              unitLabel={product.unitLabel}
              className="min-w-0"
            />

            {/* Round lavender add-to-cart; becomes a stepper once in the cart. */}
            {!outOfStock ? (
              <span onClick={(event) => event.preventDefault()} className="shrink-0">
                {quantityInCart === 0 ? (
                  <motion.button
                    type="button"
                    onClick={() => addItem(product.id, 1, product.stockQuantity)}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Add ${product.name} to cart`}
                    className="flex size-10 items-center justify-center rounded-pill bg-primary-soft text-primary transition-colors hover:bg-primary hover:text-on-primary"
                  >
                    <ShoppingCart className="size-4" />
                  </motion.button>
                ) : (
                  <span className="flex items-stretch overflow-hidden rounded-pill bg-primary text-on-primary">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(product.id, quantityInCart - 1, product.stockQuantity)
                      }
                      aria-label={`Decrease quantity of ${product.name}`}
                      className="flex h-10 w-8 items-center justify-center transition-colors hover:bg-primary-hover"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="flex min-w-6 items-center justify-center text-sm font-bold">
                      {quantityInCart}
                    </span>
                    <button
                      type="button"
                      onClick={() => addItem(product.id, 1, product.stockQuantity)}
                      disabled={quantityInCart >= product.stockQuantity}
                      aria-label={`Increase quantity of ${product.name}`}
                      className="flex h-10 w-8 items-center justify-center transition-colors hover:bg-primary-hover disabled:opacity-50"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </span>
                )}
              </span>
            ) : null}
          </div>

          <div className="flex min-h-4 items-center gap-1 text-[0.6875rem] font-semibold">
            {lowStock ? (
              <span className="text-warning">Only {product.stockQuantity} left</span>
            ) : outOfStock ? (
              <span className="text-content-subtle">Back in stock soon</span>
            ) : (
              <>
                <Check className="size-3 text-success" aria-hidden />
                <span className="text-success">In stock · 2 day delivery</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
