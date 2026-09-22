import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductGrid } from '@/components/product/ProductGrid'
import { QuantityStepper } from '@/components/product/QuantityStepper'
import { ReviewsSection } from '@/components/product/ReviewsSection'
import { SpecTable } from '@/components/product/SpecTable'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCategories,
  useCategoryAttributes,
  useProductBySlug,
  useProductReviews,
  useRelatedProducts,
} from '@/features/catalog/queries'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { extractGst, formatPrice } from '@/lib/utils'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [quantity, setQuantity] = useState(1)

  const { data: product, isLoading, isError } = useProductBySlug(slug)
  const { data: attributes = [] } = useCategoryAttributes(product?.categoryId)
  const { data: related } = useRelatedProducts(product?.categoryId, product?.id, 4)
  const { data: reviews, isLoading: reviewsLoading } = useProductReviews(product?.id)

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
    title: product ? `${product.name} — Dhuraj Interiors` : 'Product — Dhuraj Interiors',
    description: product?.description ?? undefined,
    jsonLd,
  })

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

  return (
    <div className="container-page py-10 lg:py-14">
      <nav className="mb-6 text-xs text-sand-500">
        <Link to="/" className="hover:text-brand-700">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link to="/shop" className="hover:text-brand-700">
          Shop
        </Link>
        {category ? (
          <>
            <span className="mx-1.5">/</span>
            <Link to={`/category/${category.slug}`} className="hover:text-brand-700">
              {category.name}
            </Link>
          </>
        ) : null}
        <span className="mx-1.5">/</span>
        <span className="text-sand-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.brand ? (
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-sand-500 uppercase">
              {product.brand}
            </p>
          ) : null}
          <h1 className="font-display text-2xl font-semibold text-sand-900 lg:text-3xl">
            {product.name}
          </h1>

          {product.ratingCount > 0 ? (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-sand-600">
              <Star className="size-4 fill-brass-500 text-brass-500" />
              <span className="font-medium">{product.ratingAvg.toFixed(1)}</span>
              <span>({product.ratingCount} reviews)</span>
            </div>
          ) : null}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-sand-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice ? (
              <span className="text-lg text-sand-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
            {discountPct ? <Badge variant="accent">{discountPct}% off</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-sand-500">
            Inclusive of {formatPrice(gstAmount, true)} GST ({product.gstRate}%) · per {product.unitLabel}
          </p>

          <div className="mt-4">
            {outOfStock ? (
              <Badge variant="danger">Out of stock</Badge>
            ) : lowStock ? (
              <Badge variant="danger">Only {product.stockQuantity} left</Badge>
            ) : (
              <Badge variant="success">In stock</Badge>
            )}
          </div>

          {product.description ? (
            <p className="mt-5 leading-relaxed text-sand-700">{product.description}</p>
          ) : null}

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

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={outOfStock}
              title="Cart arrives in Phase 5"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-800 px-6 text-sm font-medium text-sand-50 transition-colors hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-40"
            >
              <ShoppingBag className="size-4" />
              Add to cart
            </button>
            <button
              type="button"
              title="Wishlist arrives in Phase 5"
              className="flex size-12 items-center justify-center rounded-xl border border-sand-300 text-sand-600 transition-colors hover:border-brand-600 hover:text-brand-800"
              aria-label="Add to wishlist"
            >
              <Heart className="size-5" />
            </button>
          </div>

          {attributes.length ? (
            <div className="mt-10">
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-sand-900 uppercase">
                Specifications
              </h2>
              <SpecTable attributes={attributes} values={product.attributes} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-16 border-t border-sand-200 pt-10">
        <h2 className="mb-6 font-display text-2xl font-semibold text-sand-900">Reviews</h2>
        <ReviewsSection reviews={reviews} isLoading={reviewsLoading} />
      </div>

      {related?.length ? (
        <div className="mt-16 border-t border-sand-200 pt-10">
          <h2 className="mb-6 font-display text-2xl font-semibold text-sand-900">
            You might also need
          </h2>
          <ProductGrid products={related} />
        </div>
      ) : null}
    </div>
  )
}
