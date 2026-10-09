import { ShoppingBag, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { QuantityStepper } from '@/components/product/QuantityStepper'
import { PromoCodeField } from '@/components/cart/PromoCodeField'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartLines } from '@/features/cart/useCartLines'
import { useCartStore } from '@/features/cart/store'
import { useCoupon } from '@/features/coupon/useCoupon'
import { productImageUrl } from '@/lib/supabase/client'
import { extractGst, formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { lines, subtotal, isLoading } = useCartLines()
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const coupon = useCoupon(subtotal)

  const gstTotal = lines.reduce(
    (sum, line) => sum + extractGst(line.product.price, line.product.gstRate) * line.quantity,
    0,
  )

  if (isLoading) {
    return (
      <div className="container-page py-10 lg:py-14">
        <Skeleton className="mb-8 h-9 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-pill bg-primary-soft text-primary"><ShoppingBag className="size-7" /></span>
        <h1 className="text-h2 mt-4 text-content">Your cart is empty</h1>
        <p className="mt-2 text-ink-600">Browse the catalogue and add what you need.</p>
        <Link to="/shop" className={`mt-6 ${buttonVariants({ variant: 'primary' })}`}>
          Shop all products
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="text-h1 mb-8 text-content">
        Your Cart
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {lines.map((line) => {
            const imageUrl = productImageUrl(line.product.primaryImagePath, { width: 200 })
            return (
              <li
                key={line.product.id}
                className="flex gap-4 rounded-card border border-border-subtle bg-card p-4"
              >
                <Link
                  to={`/product/${line.product.slug}`}
                  className="size-24 shrink-0 overflow-hidden rounded-sm bg-surface-sunken"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <ProductImagePlaceholder size="sm" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/product/${line.product.slug}`}
                        className="line-clamp-2 text-sm font-medium text-content hover:text-iris-800"
                      >
                        {line.product.name}
                      </Link>
                      <p className="mt-1 text-sm text-content-muted">{formatPrice(line.product.price)}</p>
                      {line.quantity >= line.product.stockQuantity ? (
                        <p className="mt-1 text-xs text-warning">
                          Only {line.product.stockQuantity} in stock
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.product.id)}
                      className="rounded-sm p-1.5 text-content-subtle hover:bg-surface-sunken hover:text-danger"
                      aria-label={`Remove ${line.product.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <QuantityStepper
                      value={line.quantity}
                      onChange={(qty) => setQuantity(line.product.id, qty, line.product.stockQuantity)}
                      max={line.product.stockQuantity}
                      unitLabel={line.product.unitLabel}
                    />
                    <span className="text-sm font-semibold text-content">
                      {formatPrice(line.lineTotal)}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="h-fit rounded-card border border-border-subtle bg-surface p-6">
          <h2 className="mb-4 text-base font-bold text-content">
            Order Summary
          </h2>
          <div className="mb-4">
            <PromoCodeField coupon={coupon} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal</span>
              <span className="text-content">{formatPrice(subtotal)}</span>
            </div>
            {coupon.discount > 0 ? (
              <div className="flex justify-between text-ink-600">
                <span>Discount ({coupon.applied?.code})</span>
                <span className="font-semibold text-success">−{formatPrice(coupon.discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-content-muted">
              <span>Incl. GST</span>
              <span>{formatPrice(gstTotal, true)}</span>
            </div>
            <div className="flex justify-between text-content-muted">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border-subtle pt-4 text-base font-semibold text-content">
            <span>Total</span>
            <span>{formatPrice(Math.max(0, subtotal - coupon.discount))}</span>
          </div>
          <Link to="/checkout" className={`mt-6 ${buttonVariants({ variant: 'primary', block: true })}`}>
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
