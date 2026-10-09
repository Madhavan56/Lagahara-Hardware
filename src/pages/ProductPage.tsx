import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { Check, Heart, ShoppingBag } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductGrid } from '@/components/product/ProductGrid'
import { QuantityStepper } from '@/components/product/QuantityStepper'
import { ReviewsSection } from '@/components/product/ReviewsSection'
import { SpecTable } from '@/components/product/SpecTable'
import { Badge } from '@/components/ui/badge'
import { Price } from '@/components/ui/price'
import { Rating } from '@/components/ui/rating'
import { StatusPill } from '@/components/ui/status-pill'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartStore } from '@/features/cart/store'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  useCategories,
  useCategoryAttributes,
  useProductBySlug,
  useProductReviewEligibility,
  useProductReviews,
  useRelatedProducts,
} from '@/features/catalog/queries'
import { useIsWishlisted, useWishlistStore } from '@/features/wishlist/store'
import { showToast } from '@/features/toast/store'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { DURATION, EASE, SPRING } from '@/lib/motion'
import { cn, extractGst, formatPrice } from '@/lib/utils'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const reduce = useReducedMotion()
  const addedTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(addedTimer.current), [])

  // The sticky mobile bar appears once the main add-to-cart button scrolls away.
  const buyBoxRef = useRef<HTMLDivElement>(null)
  const [buyBoxVisible, setBuyBoxVisible] = useState(true)

  const { data: product, isLoading, isError } = useProductBySlug(slug)
  const addToCart = useCartStore((state) => state.addItem)
  const wishlisted = useIsWishlisted(product?.id ?? '')
  const toggleWishlist = useWishlistStore((state) => state.toggle)
  const { data: attributes = [] } = useCategoryAttributes(product?.categoryId)
  const { data: related } = useRelatedProducts(product?.categoryId, product?.id, 4)
  const { data: reviews, isLoading: reviewsLoading } = useProductReviews(product?.id)
  const { user, loading: authLoading } = useAuth()
  const reviewEligibility = useProductReviewEligibility(product?.id, Boolean(user) && !authLoading)

  // The product row only carries category_id, not its slug/name. Categories
  // are already cached with a 10-minute staleTime, so resolving the
  // breadcrumb from that list avoids a second round trip.
  const { data: categories } = useCategories()
  const category = categories?.find((c) => c.id === product?.categoryId)

  const jsonLd = useMemo(() => {
    if (!product) return undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: product.sku,
      brand: product.brand ?? undefined,
      description: product.description ?? undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: product.price,
        availability:
          product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
      aggregateRating:
        product.ratingCount > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: product.ratingAvg,
              reviewCount: product.ratingCount,
            }
          : undefined,
    }
  }, [product])

  useDocumentHead({
    title: product ? `${product.name} | Laghara Hardwares` : 'Product | Laghara Hardwares',
    description: product?.description ?? undefined,
    jsonLd,
  })

  useEffect(() => {
    const node = buyBoxRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setBuyBoxVisible(entry?.isIntersecting ?? true))
    observer.observe(node)
    return () => observer.disconnect()
  }, [product?.id])

  if (isLoading) {
    return (
      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-card" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return <Navigate to="/shop" replace />
  }

  const gstAmount = extractGst(product.price, product.gstRate)
  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null
  const outOfStock = product.stockQuantity === 0
  const lowStock = !outOfStock && product.stockQuantity <= product.lowStockThreshold

  function handleAddToCart() {
    if (!product) return
    addToCart(product.id, quantity, product.stockQuantity)
    showToast({ title: 'Added to cart', description: `${quantity} × ${product.name}` })
    setJustAdded(true)
    window.clearTimeout(addedTimer.current)
    addedTimer.current = window.setTimeout(() => setJustAdded(false), 1800)
  }

  const addLabel = (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.span
        key={String(justAdded)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: DURATION.fast, ease: EASE.expo }}
        className="flex items-center gap-2"
      >
        {justAdded ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
        {justAdded ? 'Added to cart' : 'Add to cart'}
      </m.span>
    </AnimatePresence>
  )

  const tabs: ProductTab[] = [
    ...(product.description
      ? [{ id: 'details', label: 'Details', content: <p className="max-w-[65ch] leading-relaxed text-ink-700">{product.description}</p> }]
      : []),
    ...(attributes.length
      ? [{ id: 'specs', label: 'Specifications', content: <SpecTable attributes={attributes} values={product.attributes} /> }]
      : []),
    {
      id: 'reviews',
      label: product.ratingCount > 0 ? `Reviews (${product.ratingCount})` : 'Reviews',
      content: (
        <ReviewsSection
          productId={product.id}
          reviews={reviews}
          isLoading={reviewsLoading}
          eligibility={reviewEligibility.data}
          eligibilityLoading={reviewEligibility.isLoading}
        />
      ),
    },
  ]

  return (
    <div className="container-page py-10 lg:py-14">
      <nav className="mb-6 text-xs text-content-muted">
        <Link to="/" className="hover:text-iris-700">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link to="/shop" className="hover:text-iris-700">
          Shop
        </Link>
        {category ? (
          <>
            <span className="mx-1.5">/</span>
            <Link to={`/category/${category.slug}`} className="hover:text-iris-700">
              {category.name}
            </Link>
          </>
        ) : null}
        <span className="mx-1.5">/</span>
        <span className="text-ink-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.brand ? (
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-content-muted uppercase">
              {product.brand}
            </p>
          ) : null}
          <h1 className="text-h1 text-content">
            {product.name}
          </h1>

          {product.ratingCount > 0 ? (
            <Rating value={product.ratingAvg} count={product.ratingCount} className="mt-2" />
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Price value={product.price} compareAt={product.compareAtPrice} size="lg" />
            {discountPct ? <StatusPill tone="discount">−{discountPct}% off</StatusPill> : null}
          </div>
          <p className="mt-1 text-sm text-content-muted">
            Inclusive of {formatPrice(gstAmount, true)} GST ({product.gstRate}%) · per {product.unitLabel}
          </p>

          <div className="mt-4">
            {outOfStock ? (
              <Badge variant="danger">Out of stock</Badge>
            ) : lowStock ? (
              <Badge variant="warning">Only {product.stockQuantity} left</Badge>
            ) : (
              <Badge variant="success">In stock</Badge>
            )}
          </div>


          {!outOfStock ? (
            <div className="mt-6">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={product.stockQuantity}
                unitLabel={product.unitLabel}
              />
            </div>
          ) : null}

          <div ref={buyBoxRef} className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={outOfStock}
              onClick={handleAddToCart}
              className="flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-pill bg-primary px-6 text-sm font-bold text-on-primary shadow-primary transition-[background-color,transform] duration-(--duration-fast) hover:bg-primary-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
            >
              {addLabel}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="flex size-12 items-center justify-center rounded-pill border border-border-strong text-ink-600 transition-colors hover:border-primary hover:text-primary"
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wishlisted}
            >
              <m.span
                key={String(wishlisted)}
                initial={wishlisted && !reduce ? { scale: 0.5 } : false}
                animate={{ scale: 1 }}
                transition={SPRING}
                className="flex"
              >
                <Heart className={cn('size-5', wishlisted && 'fill-danger text-danger')} />
              </m.span>
            </button>
          </div>

        </div>
      </div>

      <div className="mt-14">
        <ProductTabs tabs={tabs} />
      </div>

      {related?.length ? (
        <div className="mt-16 border-t border-border-subtle pt-10">
          <h2 className="text-h2 mb-6 text-content">
            You might also need
          </h2>
          <ProductGrid products={related} />
        </div>
      ) : null}

      {/* Sticky add-to-cart for phones, shown once the main button scrolls out of view. */}
      {!outOfStock ? (
        <AnimatePresence>
          {!buyBoxVisible ? (
            <m.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: DURATION.base, ease: EASE.expo }}
              className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-card/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-float backdrop-blur-md lg:hidden"
            >
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-content-muted">{product.name}</p>
                  <Price value={product.price} compareAt={product.compareAtPrice} />
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex h-11 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-primary px-5 text-sm font-bold text-on-primary shadow-primary transition-transform duration-(--duration-fast) active:scale-[0.98]"
                >
                  {addLabel}
                </button>
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      ) : null}
    </div>
  )
}

type ProductTab = { id: string; label: string; content: ReactNode }

/**
 * Accessible tabs with a sliding underline. Inactive panels stay in the DOM
 * (hidden), so their content is still indexable and keeps its state.
 */
function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id)
  const baseId = useId()
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())

  function onKeyDown(event: React.KeyboardEvent) {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const index = tabs.findIndex((tab) => tab.id === activeId)
    const next = tabs[(index + delta + tabs.length) % tabs.length]
    if (!next) return
    setActiveId(next.id)
    tabRefs.current.get(next.id)?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label="Product information" onKeyDown={onKeyDown} className="flex gap-6 overflow-x-auto border-b border-border-subtle">
        {tabs.map((tab) => {
          const selected = tab.id === activeId
          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) tabRefs.current.set(tab.id, node)
                else tabRefs.current.delete(tab.id)
              }}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                'relative shrink-0 pb-3 text-sm font-bold whitespace-nowrap transition-colors duration-(--duration-fast)',
                selected ? 'text-content' : 'text-content-muted hover:text-content',
              )}
            >
              {tab.label}
              {selected ? (
                <m.span
                  layoutId={`${baseId}-underline`}
                  transition={{ duration: DURATION.base, ease: EASE.expo }}
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-pill bg-primary"
                />
              ) : null}
            </button>
          )
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== activeId}
          className="pt-6"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
