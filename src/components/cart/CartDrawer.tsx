import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { useCartLines } from '@/features/cart/useCartLines'
import { useCartStore } from '@/features/cart/store'
import { useCartUiStore } from '@/features/cart/uiStore'
import { productImageUrl } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const isOpen = useCartUiStore((state) => state.isDrawerOpen)
  const closeDrawer = useCartUiStore((state) => state.closeDrawer)
  const { lines, subtotal, isLoading } = useCartLines()
  const removeItem = useCartStore((state) => state.removeItem)

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
          >
            <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-sand-900">
                Your Cart {lines.length ? `(${lines.length})` : ''}
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

            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <p className="text-sm text-sand-500">Loading…</p>
              ) : lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="size-10 text-sand-300" />
                  <p className="mt-3 text-sm text-sand-500">Your cart is empty.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {lines.map((line) => {
                    const imageUrl = productImageUrl(line.product.primaryImagePath, { width: 150 })
                    return (
                      <li key={line.product.id} className="flex gap-3">
                        <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                          {imageUrl ? (
                            <img src={imageUrl} alt="" className="size-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-sand-900">
                            {line.product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-sand-500">
                            {line.quantity} × {formatPrice(line.product.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(line.product.id)}
                          className="self-start text-xs text-sand-400 hover:text-danger"
                          aria-label={`Remove ${line.product.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {lines.length > 0 ? (
              <div className="border-t border-sand-200 p-5">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-sand-600">Subtotal</span>
                  <span className="font-semibold text-sand-900">{formatPrice(subtotal)}</span>
                </div>
                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className={buttonVariants({ variant: 'primary', block: true })}
                >
                  View cart
                </Link>
              </div>
            ) : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
