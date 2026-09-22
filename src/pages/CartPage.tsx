import { ShoppingBag, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { QuantityStepper } from '@/components/product/QuantityStepper'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartLines } from '@/features/cart/useCartLines'
import { useCartStore } from '@/features/cart/store'
import { productImageUrl } from '@/lib/supabase/client'
import { extractGst, formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { lines, subtotal, isLoading } = useCartLines()
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

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
        <ShoppingBag className="size-12 text-sand-300" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-sand-900">Your cart is empty</h1>
        <p className="mt-2 text-sand-600">Browse the catalogue and add what you need.</p>
        <Link to="/shop" className={`mt-6 ${buttonVariants({ variant: 'primary' })}`}>
          Shop all products
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="mb-8 font-display text-3xl font-semibold text-sand-900 lg:text-4xl">
        Your Cart
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {lines.map((line) => {
            const imageUrl = productImageUrl(line.product.primaryImagePath, { width: 200 })
            return (
              <li
                key={line.product.id}
                className="flex gap-4 rounded-card border border-sand-200 bg-white p-4"
              >
                <Link
                  to={`/product/${line.product.slug}`}
                  className="size-24 shrink-0 overflow-hidden rounded-lg bg-sand-100"
                >
                  {imageUrl ? <img src={imageUrl} alt="" className="size-full object-cover" /> : null}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/product/${line.product.slug}`}
                        className="line-clamp-2 text-sm font-medium text-sand-900 hover:text-brand-800"
                      >
                        {line.product.name}
                      </Link>
                      <p className="mt-1 text-sm text-sand-500">{formatPrice(line.product.price)}</p>
                      {line.quantity >= line.product.stockQuantity ? (
                        <p className="mt-1 text-xs text-warning">
                          Only {line.product.stockQuantity} in stock
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.product.id)}
                      className="rounded-lg p-1.5 text-sand-400 hover:bg-sand-100 hover:text-danger"
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
                    <span className="text-sm font-semibold text-sand-900">
                      {formatPrice(line.lineTotal)}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="h-fit rounded-card border border-sand-200 bg-sand-50 p-6">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-sand-900 uppercase">
            Order Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-sand-600">
              <span>Subtotal</span>
              <span className="text-sand-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sand-500">
              <span>Incl. GST</span>
              <span>{formatPrice(gstTotal, true)}</span>
            </div>
            <div className="flex justify-between text-sand-500">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-sand-200 pt-4 text-base font-semibold text-sand-900">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link to="/checkout" className={`mt-6 ${buttonVariants({ variant: 'primary', block: true })}`}>
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
