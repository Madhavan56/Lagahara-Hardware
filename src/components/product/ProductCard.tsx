import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { Check, Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { Price } from '@/components/ui/price'
import { Rating } from '@/components/ui/rating'
import { StatusPill, deriveProductStatus } from '@/components/ui/status-pill'
import { useCartStore } from '@/features/cart/store'
import { useCategoryNameMap } from '@/features/catalog/queries'
import { showToast } from '@/features/toast/store'
import { useIsWishlisted, useWishlistStore } from '@/features/wishlist/store'
import { DURATION, EASE, SPRING } from '@/lib/motion'
import { productImageUrl } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ProductListItem } from '@/types/catalog'

const LOW_STOCK_THRESHOLD = 5
/** How long the stepper shows a check mark after an add. The stepper is usable throughout. */
const ADDED_FLASH_MS = 900

export function ProductCard({ product }: { product: ProductListItem }) {
  const imageUrl = productImageUrl(product.primaryImagePath, { width: 400 })
  const hoverImageUrl = product.secondaryImagePath ? productImageUrl(product.secondaryImagePath, { width: 400 }) : null
  const reduce = useReducedMotion()
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

  // Presentation-only flash after an add; the cart has already been updated.
  const [justAdded, setJustAdded] = useState(false)
  const flashTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(flashTimer.current), [])

  function handleAdd() {
    addItem(product.id, 1, product.stockQuantity)
    setJustAdded(true)
    window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setJustAdded(false), ADDED_FLASH_MS)
  }

  return (
    // Double-bezel: a hairline tray (outer shell) holding the card (inner core).
    <m.div
      whileHover={{ y: -4 }}
      transition={{ duration: DURATION.base, ease: EASE.fluid }}
      className="h-full rounded-[1.5rem] bg-ink-950/[0.03] p-1 ring-1 ring-ink-950/[0.06]"
    >
      <Link
        to={`/product/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-0.25rem)] bg-card shadow-[inset_0_1px_1px_rgb(255_255_255/0.7),0_1px_2px_rgb(60_39_130/0.04)] transition-shadow duration-(--duration-slow) ease-[var(--ease-fluid)] hover:shadow-lift"
      >
        {/* Light-grey image tile with the product centred. */}
        <div className="relative aspect-square overflow-hidden bg-surface-sunken">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className={cn(
                'size-full object-cover transition-[transform,opacity] duration-(--duration-slow) ease-[var(--ease-out-expo)] group-hover:scale-105',
                hoverImageUrl && '[@media(hover:hover)]:group-hover:opacity-0',
              )}
            />
          ) : (
            <ProductImagePlaceholder size="md" />
          )}

          {/* Second photo cross-fades in on hover (pointer devices only). */}
          {imageUrl && hoverImageUrl ? (
            <img
              src={hoverImageUrl}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 hidden size-full object-cover opacity-0 transition-[transform,opacity] duration-(--duration-slow) ease-[var(--ease-out-expo)] group-hover:scale-105 group-hover:opacity-100 [@media(hover:hover)]:block"
            />
          ) : null}

          {status ? (
            <StatusPill tone={status.tone} className="absolute top-3 left-3">
              {status.label}
            </StatusPill>
          ) : null}

          <m.button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              toggleWishlist(product.id)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-pill bg-card text-ink-600 shadow-xs transition-colors hover:text-pill-best"
          >
            {/* Keyed on state so the heart pops each time it is toggled on. */}
            <m.span
              key={String(wishlisted)}
              initial={wishlisted && !reduce ? { scale: 0.5 } : false}
              animate={{ scale: 1 }}
              transition={SPRING}
              className="flex"
            >
              <Heart className={cn('size-4', wishlisted && 'fill-pill-best text-pill-best')} />
            </m.span>
          </m.button>
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
                  <m.button
                    type="button"
                    onClick={() => {
                      handleAdd()
                      showToast({ title: 'Added to cart', description: product.name })
                    }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Add ${product.name} to cart`}
                    className="flex size-10 items-center justify-center rounded-pill bg-primary-soft text-primary transition-colors hover:bg-primary hover:text-on-primary"
                  >
                    <ShoppingCart className="size-4" />
                  </m.button>
                ) : (
                  <m.span
                    initial={reduce ? false : { scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={SPRING}
                    className="flex items-stretch overflow-hidden rounded-pill bg-primary text-on-primary"
                  >
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
                    <span className="relative flex min-w-6 items-center justify-center overflow-hidden text-sm font-bold" aria-live="polite">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {justAdded ? (
                          <m.span
                            key="added"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={SPRING}
                            className="flex"
                          >
                            <Check className="size-4" strokeWidth={3} aria-label={`${quantityInCart} in cart`} />
                          </m.span>
                        ) : (
                          <m.span
                            key={quantityInCart}
                            initial={{ y: 8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -8, opacity: 0 }}
                            transition={{ duration: DURATION.fast, ease: EASE.expo }}
                          >
                            {quantityInCart}
                          </m.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={quantityInCart >= product.stockQuantity}
                      aria-label={`Increase quantity of ${product.name}`}
                      className="flex h-10 w-8 items-center justify-center transition-colors hover:bg-primary-hover disabled:opacity-50"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </m.span>
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
    </m.div>
  )
}
