import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCancelOrder, useOrder } from '@/features/orders/queries'
import { productImageUrl } from '@/lib/supabase/client'
import { extractGst, formatDate, formatPrice } from '@/lib/utils'

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading, isError } = useOrder(orderId)
  const cancelOrder = useCancelOrder()
  const [cancelError, setCancelError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="container-page py-10 lg:py-14">
        <Skeleton className="mb-8 h-9 w-64" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    )
  }

  if (isError || !order) {
    return <Navigate to="/account/orders" replace />
  }

  const gstTotal = order.items.reduce(
    (sum, item) => sum + extractGst(item.unitPrice, item.gstRate) * item.quantity,
    0,
  )

  async function handleCancel() {
    if (!order) return
    setCancelError(null)
    try {
      await cancelOrder.mutateAsync(order.id)
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Could not cancel order')
    }
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <Link to="/account/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-sand-600 hover:text-brand-800">
        <ChevronLeft className="size-4" />
        Back to orders
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-sand-900 lg:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-sand-500">Placed {formatDate(order.placedAt ?? order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-sand-900 uppercase">Items</h2>
            <ul className="space-y-3">
              {order.items.map((item) => {
                const imageUrl = productImageUrl(item.productImagePath, { width: 150 })
                return (
                  <li key={item.id} className="flex items-center gap-4 rounded-card border border-sand-200 bg-white p-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <ProductImagePlaceholder size="sm" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.productSlug ? (
                        <Link to={`/product/${item.productSlug}`} className="text-sm font-medium text-sand-900 hover:text-brand-800">
                          {item.productName}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-sand-900">{item.productName}</p>
                      )}
                      <p className="mt-0.5 text-xs text-sand-500">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-sand-900">{formatPrice(item.lineTotal)}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-sand-900 uppercase">Status</h2>
            <OrderStatusTimeline events={order.statusEvents} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-card border border-sand-200 bg-sand-50 p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-sand-900 uppercase">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-sand-600">
                <span>Subtotal</span>
                <span className="text-sand-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sand-500">
                <span>Incl. GST</span>
                <span>{formatPrice(gstTotal, true)}</span>
              </div>
              <div className="flex justify-between text-sand-600">
                <span>Shipping ({order.shippingMethodName})</span>
                <span className="text-sand-900">{formatPrice(order.shippingAmount)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-sand-200 pt-4 text-base font-semibold text-sand-900">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>

            {order.status === 'pending' ? (
              <div className="mt-6">
                {cancelError ? <p className="mb-2 text-sm text-danger">{cancelError}</p> : null}
                <Button variant="danger" block loading={cancelOrder.isPending} onClick={handleCancel}>
                  Cancel order
                </Button>
              </div>
            ) : null}
          </div>

          <div className="rounded-card border border-sand-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-sand-900 uppercase">
              Shipping to
            </h2>
            <p className="text-sm text-sand-700">{order.shippingAddress.full_name}</p>
            <p className="text-sm text-sand-600">{order.shippingAddress.phone}</p>
            <p className="mt-1 text-sm text-sand-600">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''},{' '}
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
