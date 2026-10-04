import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PromoCodeField } from '@/components/cart/PromoCodeField'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { useCartStore } from '@/features/cart/store'
import { useCartLines } from '@/features/cart/useCartLines'
import { useCartUiStore } from '@/features/cart/uiStore'
import { useCoupon } from '@/features/coupon/useCoupon'
import { productImageUrl } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

/** Order value that unlocks free standard shipping (matches trade-floor norm). */
const FREE_SHIPPING_THRESHOLD = 5000

export function CartDrawer() {
  const isOpen = useCartUiStore((state) => state.isDrawerOpen)
  const closeDrawer = useCartUiStore((state) => state.closeDrawer)
  const { lines, itemCount, subtotal, isLoading } = useCartLines()
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const coupon = useCoupon(subtotal)

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progressPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
  const estimatedTotal = Math.max(0, subtotal - coupon.discount)

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-[92%] max-w-md flex-col bg-card"
            role="dialog"
            aria-label="Cart"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <h2 className="text-h3 text-content">
                My Cart {itemCount ? `(${itemCount})` : ''}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-pill p-2 text-ink-600 transition-colors hover:bg-surface-sunken"
                aria-label="Close cart"
              >
                <X className="size-5" />
              </button>
            </div>

            {lines.length > 0 ? (
              <div className="border-b border-border-subtle bg-surface px-5 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-700">
                  <Truck className="size-4 text-primary" aria-hidden />
                  {remainingForFreeShipping > 0 ? (
                    <span>Add {formatPrice(remainingForFreeShipping)} more for free shipping</span>
                  ) : (
                    <span className="text-success">Free shipping unlocked</span>
                  )}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-ink-200">
                  <motion.div
                    className="h-full rounded-pill bg-primary"
                    initial={false}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <p className="text-sm text-content-muted">Loading…</p>
              ) : lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex size-16 items-center justify-center rounded-pill bg-primary-soft text-primary">
                    <ShoppingBag className="size-7" />
                  </span>
                  <p className="mt-4 text-sm text-content-muted">Your cart is empty.</p>
                  <Link
                    to="/shop"
                    onClick={closeDrawer}
                    className="mt-5 inline-flex h-11 items-center rounded-pill bg-primary px-6 text-sm font-bold text-on-primary shadow-primary transition-colors hover:bg-primary-hover"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => {
                      const imageUrl = productImageUrl(line.product.primaryImagePath, { width: 150 })
                      return (
                        <motion.li
                          key={line.product.id}
                          layout
                          initial={{ opacity: 0, height: 0, marginTop: '-1rem' }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                          exit={{ opacity: 0, height: 0, marginTop: '-1rem' }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="flex gap-3 overflow-hidden"
                        >
                          <Link
                            to={`/product/${line.product.slug}`}
                            onClick={closeDrawer}
                            className="size-18 shrink-0 overflow-hidden rounded-md bg-surface-sunken"
                          >
                            {imageUrl ? (
                              <img src={imageUrl} alt="" className="size-full object-cover" />
                            ) : (
                              <ProductImagePlaceholder size="sm" />
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-bold text-content">
                              {line.product.name}
                            </p>
                            <p className="mt-0.5 text-xs text-content-muted">
                              {formatPrice(line.product.price)} / {line.product.unitLabel}
                            </p>

                            <div className="mt-2 flex items-center gap-3">
                              <div className="flex items-stretch overflow-hidden rounded-pill bg-surface-sunken">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuantity(
                                      line.product.id,
                                      line.quantity - 1,
                                      line.product.stockQuantity,
                                    )
                                  }
                                  aria-label={`Decrease quantity of ${line.product.name}`}
                                  className="flex size-8 items-center justify-center text-ink-600 transition-colors hover:bg-ink-200 hover:text-content"
                                >
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="flex w-7 items-center justify-center text-xs font-bold text-content">
                                  {line.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuantity(
                                      line.product.id,
                                      line.quantity + 1,
                                      line.product.stockQuantity,
                                    )
                                  }
                                  disabled={line.quantity >= line.product.stockQuantity}
                                  aria-label={`Increase quantity of ${line.product.name}`}
                                  className="flex size-8 items-center justify-center text-ink-600 transition-colors hover:bg-ink-200 hover:text-content disabled:opacity-40"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(line.product.id)}
                                className="rounded-pill p-1.5 text-content-subtle transition-colors hover:bg-danger-surface hover:text-danger"
                                aria-label={`Remove ${line.product.name} from cart`}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>

                          <motion.span
                            key={line.lineTotal}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="shrink-0 text-sm font-extrabold text-content"
                          >
                            {formatPrice(line.lineTotal)}
                          </motion.span>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 ? (
              <div className="space-y-3 border-t border-border-subtle p-5">
                <PromoCodeField coupon={coupon} />

                <dl className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-content-muted">Subtotal</dt>
                    <dd className="font-semibold text-content">{formatPrice(subtotal)}</dd>
                  </div>
                  {coupon.discount > 0 ? (
                    <div className="flex items-center justify-between">
                      <dt className="text-content-muted">Discount</dt>
                      <dd className="font-semibold text-success">
                        −{formatPrice(coupon.discount)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <dt className="text-content-muted">Shipping</dt>
                    {/* Real figure depends on the method chosen at checkout — no
                        number is invented here. */}
                    <dd className="text-xs font-semibold text-content-muted">
                      Calculated at checkout
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-2">
                    <dt className="font-bold text-content">Total</dt>
                    <dd className="text-lg font-extrabold text-content">
                      {formatPrice(estimatedTotal)}
                    </dd>
                  </div>
                </dl>

                <Link
                  to="/checkout"
                  onClick={closeDrawer}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary text-sm font-bold text-on-primary shadow-primary transition-all hover:bg-primary-hover active:translate-y-px"
                >
                  <ShieldCheck className="size-4" aria-hidden />
                  Checkout
                </Link>

                <p className="text-center text-[0.6875rem] text-content-muted">
                  Inclusive of all taxes · GST invoice provided · Payments secured by Razorpay
                </p>

                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="block text-center text-sm font-semibold text-content-muted transition-colors hover:text-primary"
                >
                  View full cart
                </Link>
              </div>
            ) : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
