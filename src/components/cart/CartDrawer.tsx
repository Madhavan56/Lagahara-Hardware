import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Truck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { useCartLines } from '@/features/cart/useCartLines'
import { useCartStore } from '@/features/cart/store'
import { useCartUiStore } from '@/features/cart/uiStore'
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

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progressPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-sand-950/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-[90%] max-w-md flex-col bg-white"
            role="dialog"
            aria-label="Cart"
          >
            <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-sand-900">
                Your Cart {itemCount ? `(${itemCount})` : ''}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-sand-600 hover:bg-sand-100"
                aria-label="Close cart"
              >
                <X className="size-5" />
              </button>
            </div>

            {lines.length > 0 ? (
              <div className="border-b border-sand-200 bg-sand-50 px-5 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-sand-700">
                  <Truck className="size-4 text-brand-600" aria-hidden />
                  {remainingForFreeShipping > 0 ? (
                    <span>
                      Add {formatPrice(remainingForFreeShipping)} more for free shipping
                    </span>
                  ) : (
                    <span className="text-brand-700">Free shipping unlocked</span>
                  )}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-200">
                  <motion.div
                    className="h-full rounded-full bg-add-500"
                    initial={false}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <p className="text-sm text-sand-500">Loading…</p>
              ) : lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="size-10 text-sand-300" />
                  <p className="mt-3 text-sm text-sand-500">Your cart is empty.</p>
                  <Link
                    to="/shop"
                    onClick={closeDrawer}
                    className="mt-4 rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {lines.map((line) => {
                    const imageUrl = productImageUrl(line.product.primaryImagePath, { width: 150 })
                    return (
                      <li key={line.product.id} className="flex gap-3">
                        <Link
                          to={`/product/${line.product.slug}`}
                          onClick={closeDrawer}
                          className="size-16 shrink-0 overflow-hidden rounded-xl bg-sand-100"
                        >
                          {imageUrl ? (
                            <img src={imageUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <ProductImagePlaceholder size="sm" />
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-sand-900">
                            {line.product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-sand-500">
                            {formatPrice(line.product.price)} / {line.product.unitLabel}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-stretch overflow-hidden rounded-lg border border-sand-300">
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantity(line.product.id, line.quantity - 1, line.product.stockQuantity)
                                }
                                aria-label={`Decrease quantity of ${line.product.name}`}
                                className="flex h-7 w-7 items-center justify-center text-sand-600 transition-colors hover:bg-sand-100"
                              >
                                −
                              </button>
                              <span className="flex w-7 items-center justify-center text-xs font-bold text-sand-900">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantity(line.product.id, line.quantity + 1, line.product.stockQuantity)
                                }
                                disabled={line.quantity >= line.product.stockQuantity}
                                aria-label={`Increase quantity of ${line.product.name}`}
                                className="flex h-7 w-7 items-center justify-center text-sand-600 transition-colors hover:bg-sand-100 disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(line.product.id)}
                              className="text-xs font-semibold text-sand-400 transition-colors hover:text-danger"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-sand-900">
                          {formatPrice(line.lineTotal)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {lines.length > 0 ? (
              <div className="border-t border-sand-200 p-5">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-sand-600">Subtotal</span>
                  <span className="text-lg font-extrabold text-sand-900">{formatPrice(subtotal)}</span>
                </div>
                <p className="mb-3 text-xs text-sand-500">Inclusive of all taxes · GST invoice provided</p>
                <Link
                  to="/checkout"
                  onClick={closeDrawer}
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-brass-500 text-sm font-bold text-white shadow-card transition-all hover:bg-brass-600 hover:shadow-lift active:scale-[0.99]"
                >
                  Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="mt-2 block text-center text-sm font-semibold text-sand-600 transition-colors hover:text-brand-800"
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
