import { PackageSearch } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { useMyOrders } from '@/features/orders/queries'
import { productImageUrl } from '@/lib/supabase/client'
import { formatDate, formatPrice } from '@/lib/utils'

export default function OrdersTab() {
  const { data: orders, isLoading, isError } = useMyOrders()

  if (isLoading) {
    return <p className="text-sm text-sand-500">Loading orders…</p>
  }

  if (isError) {
    return <p className="text-sm text-danger">Could not load your orders.</p>
  }

  if (!orders?.length) {
    return (
      <div className="rounded-card border border-sand-200 bg-sand-50 p-8 text-center">
        <PackageSearch className="mx-auto size-8 text-sand-400" />
        <p className="mt-3 text-sm text-sand-600">You haven't placed any orders yet.</p>
        <Link to="/shop" className="mt-3 inline-block text-sm font-medium text-brand-700">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            to={`/account/orders/${order.id}`}
            className="block rounded-card border border-sand-200 bg-white p-4 transition-colors hover:border-brand-300"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-sand-900">{order.orderNumber}</p>
                <p className="mt-0.5 text-xs text-sand-500">
                  {formatDate(order.createdAt)} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-sand-900">{formatPrice(order.total)}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            {/* Product preview: thumbnails + names, the order at a glance */}
            {order.previewItems.length > 0 ? (
              <div className="mt-3 flex items-center gap-3 border-t border-sand-100 pt-3">
                <div className="flex shrink-0 -space-x-2">
                  {order.previewItems.map((item, index) => {
                    const isLast = index === order.previewItems.length - 1 && order.moreCount === 0
                    return (
                      <span
                        key={`${order.id}-${index}`}
                        className={`size-12 overflow-hidden rounded-xl border-2 border-white bg-sand-100 ${
                          isLast ? '' : 'relative'
                        }`}
                      >
                        {item.imagePath ? (
                          <img
                            src={productImageUrl(item.imagePath, { width: 150 }) ?? undefined}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        ) : (
                          <ProductImagePlaceholder size="sm" />
                        )}
                      </span>
                    )
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-sand-700">
                    {order.previewItems.map((item) => `${item.quantity}× ${item.name}`).join(', ')}
                  </p>
                  {order.moreCount > 0 ? (
                    <p className="mt-0.5 text-xs font-semibold text-brass-600">
                      +{order.moreCount} more item{order.moreCount === 1 ? '' : 's'}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
