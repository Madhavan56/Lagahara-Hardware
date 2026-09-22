import { CheckCircle2, Plus, ShieldCheck, Truck, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AddressForm } from '@/components/account/AddressForm'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { Button } from '@/components/ui/button'
import { useAddresses, useCreateAddress } from '@/features/account/queries'
import { useAuth } from '@/features/auth/AuthProvider'
import { useCartStore } from '@/features/cart/store'
import { useCartLines } from '@/features/cart/useCartLines'
import { useShippingMethods } from '@/features/catalog/queries'
import { useCreateOrder } from '@/features/checkout/queries'
import { productImageUrl } from '@/lib/supabase/client'
import { cn, extractGst, formatEta, formatPrice } from '@/lib/utils'
import type { AddressInput } from '@/types/account'

/**
 * Single-page quick checkout: every decision (address, shipping, review) is
 * visible and editable in one scroll, with a sticky summary and one primary
 * CTA — fewer taps than a multi-step wizard, same safeguards.
 */
export default function CheckoutPage() {
  const { user } = useAuth()
  const { lines, itemCount, subtotal, isLoading: cartLoading } = useCartLines()
  const clearCart = useCartStore((state) => state.clear)

  const { data: addresses = [], isLoading: addressesLoading } = useAddresses(user?.id)
  const createAddress = useCreateAddress(user?.id)
  const { data: shippingMethods = [], isLoading: shippingLoading } = useShippingMethods()
  const createOrder = useCreateOrder()

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [addingAddress, setAddingAddress] = useState(false)
  const [selectedShippingCode, setSelectedShippingCode] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; total: number } | null>(null)

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0]
  const activeAddressId = selectedAddressId ?? defaultAddress?.id ?? null
  const activeShippingCode = selectedShippingCode ?? shippingMethods[0]?.code ?? null
  const selectedShipping = shippingMethods.find((m) => m.code === activeShippingCode)
  const readyToPlace = Boolean(activeAddressId && activeShippingCode) && lines.length > 0

  const gstTotal = lines.reduce(
    (sum, line) => sum + extractGst(line.product.price, line.product.gstRate) * line.quantity,
    0,
  )
  const total = subtotal + (selectedShipping?.price ?? 0)

  async function handlePlaceOrder() {
    if (!activeAddressId || !activeShippingCode) return
    setOrderError(null)
    try {
      const result = await createOrder.mutateAsync({
        addressId: activeAddressId,
        shippingMethodCode: activeShippingCode,
        items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
      })
      clearCart()
      setPlacedOrder({ orderNumber: result.orderNumber, total: result.total })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Could not place order')
    }
  }

  if (placedOrder) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="size-14 text-success" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-sand-900">Order placed</h1>
        <p className="mt-2 text-sand-600">
          Order <span className="font-medium text-sand-900">{placedOrder.orderNumber}</span> for{' '}
          {formatPrice(placedOrder.total)} has been created and is awaiting payment.
        </p>
        <p className="mt-1 text-sm text-sand-500">
          Payment collection (Razorpay) arrives in Phase 8 — this order will stay pending until then.
        </p>
        <Link to="/shop" className="mt-6 text-sm font-medium text-brand-700 hover:text-brand-900">
          Continue shopping
        </Link>
      </div>
    )
  }

  if (!cartLoading && lines.length === 0) {
    return <Navigate to="/cart" replace />
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sand-900 lg:text-4xl">Checkout</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-sand-600">
          <Zap className="size-4 fill-brass-500 text-brass-500" aria-hidden />
          {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for dispatch — review and place your order below.
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Delivery address */}
          <section aria-labelledby="checkout-address" className="rounded-panel border border-sand-200 bg-white p-5 lg:p-6">
            <h2 id="checkout-address" className="flex items-center gap-2 text-sm font-bold tracking-wide text-sand-900 uppercase">
              <span className="flex size-6 items-center justify-center rounded-full bg-brass-500 text-xs font-bold text-white">1</span>
              Delivery address
            </h2>

            <div className="mt-4 space-y-3">
              {addressesLoading ? (
                <p className="text-sm text-sand-500">Loading addresses…</p>
              ) : (
                addresses.map((address) => (
                  <label
                    key={address.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors',
                      activeAddressId === address.id
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-sand-200 bg-white hover:border-sand-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={activeAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-sand-900">{address.label || address.fullName}</p>
                      <p className="text-sand-600">{address.fullName} · {address.phone}</p>
                      <p className="text-sand-600">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state}{' '}
                        {address.postalCode}
                      </p>
                    </div>
                  </label>
                ))
              )}

              {addingAddress ? (
                <AddressForm
                  onSubmit={(input: AddressInput) =>
                    createAddress.mutate(
                      { input, makeDefault: addresses.length === 0 },
                      { onSuccess: () => setAddingAddress(false) },
                    )
                  }
                  onCancel={() => setAddingAddress(false)}
                  submitting={createAddress.isPending}
                />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  leadingIcon={<Plus className="size-4" />}
                  onClick={() => setAddingAddress(true)}
                >
                  Add new address
                </Button>
              )}
            </div>
          </section>

          {/* Delivery speed */}
          <section aria-labelledby="checkout-shipping" className="rounded-panel border border-sand-200 bg-white p-5 lg:p-6">
            <h2 id="checkout-shipping" className="flex items-center gap-2 text-sm font-bold tracking-wide text-sand-900 uppercase">
              <span className="flex size-6 items-center justify-center rounded-full bg-brass-500 text-xs font-bold text-white">2</span>
              Delivery speed
            </h2>

            <div className="mt-4 space-y-3">
              {shippingLoading ? (
                <p className="text-sm text-sand-500">Loading shipping options…</p>
              ) : (
                shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      'flex cursor-pointer items-start justify-between gap-3 rounded-card border p-4 transition-colors',
                      activeShippingCode === method.code
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-sand-200 bg-white hover:border-sand-300',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={activeShippingCode === method.code}
                        onChange={() => setSelectedShippingCode(method.code)}
                        className="mt-1"
                      />
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-sand-900">
                          {method.etaDaysMin <= 2 ? (
                            <Zap className="size-4 fill-brass-500 text-brass-500" aria-hidden />
                          ) : (
                            <Truck className="size-4 text-brand-700" aria-hidden />
                          )}
                          {method.name}
                        </p>
                        <p className="mt-1 text-sm text-sand-600">
                          {method.description || formatEta(method.etaDaysMin, method.etaDaysMax)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-sand-900">
                      {method.price === 0 ? 'Free' : formatPrice(method.price)}
                    </span>
                  </label>
                ))
              )}
            </div>
          </section>

          {/* Items */}
          <section aria-labelledby="checkout-items" className="rounded-panel border border-sand-200 bg-white p-5 lg:p-6">
            <h2 id="checkout-items" className="flex items-center gap-2 text-sm font-bold tracking-wide text-sand-900 uppercase">
              <span className="flex size-6 items-center justify-center rounded-full bg-brass-500 text-xs font-bold text-white">3</span>
              Review items ({itemCount})
            </h2>

            <ul className="mt-4 space-y-3">
              {lines.map((line) => {
                const imageUrl = productImageUrl(line.product.primaryImagePath, { width: 150 })
                return (
                  <li key={line.product.id} className="flex items-center gap-3 rounded-card border border-sand-200 p-3">
                    <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-sand-100">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <ProductImagePlaceholder size="sm" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-sand-900">{line.product.name}</p>
                      <p className="text-xs text-sand-500">{line.quantity} × {formatPrice(line.product.price)}</p>
                    </div>
                    <span className="text-sm font-bold text-sand-900">{formatPrice(line.lineTotal)}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        {/* Sticky summary with the single primary CTA */}
        <div className="sticky top-31 rounded-panel border border-sand-200 bg-sand-50 p-6">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-sand-900 uppercase">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-sand-600">
              <span>Subtotal ({itemCount} items)</span>
              <span className="text-sand-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sand-500">
              <span>Incl. GST</span>
              <span>{formatPrice(gstTotal, true)}</span>
            </div>
            <div className="flex justify-between text-sand-600">
              <span>Shipping</span>
              <span className="text-sand-900">
                {selectedShipping ? (selectedShipping.price === 0 ? 'Free' : formatPrice(selectedShipping.price)) : '—'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-sand-200 pt-4 text-base font-semibold text-sand-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {orderError ? (
            <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{orderError}</p>
          ) : null}

          <Button
            block
            size="lg"
            className="mt-5"
            disabled={!readyToPlace}
            loading={createOrder.isPending}
            onClick={handlePlaceOrder}
          >
            Place order
          </Button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-sand-500">
            <ShieldCheck className="size-4 text-brand-600" aria-hidden />
            GST invoice · Secure checkout
          </p>
        </div>
      </div>
    </div>
  )
}
