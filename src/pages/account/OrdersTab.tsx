import { PackageSearch } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { useMyOrders } from '@/features/orders/queries'
import { productImageUrl } from '@/lib/supabase/client'
import { cn, formatDate, formatPrice } from '@/lib/utils'
import type { OrdersViewFilter } from '@/features/orders/api'
import { Skeleton } from '@/components/ui/skeleton'

const TABS: { value: OrdersViewFilter; label: string }[] = [
  { value: 'active', label: 'Active orders' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function OrdersTab() {
  const [view, setView] = useState<OrdersViewFilter>('active')
  const { data: orders, isLoading, isError } = useMyOrders(view)

  const emptyCopy: Record<OrdersViewFilter, { title: string; hint: string }> = {
    active: {
      title: "No active orders right now.",
      hint: 'Successful and in-progress orders show up here.',
    },
    cancelled: {
      title: 'No cancelled orders.',
      hint: 'Cancelled orders are kept here for your records.',
    },
  }

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading orders" className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-sm text-danger">Could not load your orders.</p>
  }

  return (
    <div>
      {/* View switch — cancelled orders live in their own history tab */}
      <div className="mb-5 flex gap-1 rounded-md bg-surface-sunken p-1" role="tablist" aria-label="Order views">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={view === tab.value}
            onClick={() => setView(tab.value)}
            className={cn(
              'flex-1 rounded-sm px-3 py-2 text-sm font-bold transition-colors',
              view === tab.value
                ? 'bg-card text-iris-800 shadow-card'
                : 'text-content-muted hover:text-ink-700',
            )}
          >
            {tab.label}
            {view === tab.value && orders ? (
              <span className="ml-1.5 text-xs font-semibold text-content-subtle">{orders.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      {orders && orders.length === 0 ? (
        <div className="rounded-card border border-border-subtle bg-surface p-8 text-center">
          <PackageSearch className="mx-auto size-8 text-content-subtle" />
          <p className="mt-3 text-sm font-semibold text-ink-700">{emptyCopy[view].title}</p>
          <p className="mt-1 text-xs text-content-muted">{emptyCopy[view].hint}</p>
          {view === 'active' ? (
            <Link to="/shop" className="mt-3 inline-block text-sm font-medium text-iris-700">
              Start shopping
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-4">
          {orders?.map((order) => (
            <li key={order.id}>
              <Link
                to={`/account/orders/${order.id}`}
                className="block rounded-card border border-border-subtle bg-card p-4 transition-colors hover:border-iris-300"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-content">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-content-muted">
                      {formatDate(order.createdAt)} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-content">{formatPrice(order.total)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {/* Product preview: thumbnails + names, the order at a glance */}
                {order.previewItems.length > 0 ? (
                  <div className="mt-3 flex items-center gap-3 border-t border-ink-100 pt-3">
                    <div className="flex shrink-0 -space-x-2">
                      {order.previewItems.map((item, index) => (
                        <span
                          key={`${order.id}-${index}`}
                          className="size-12 overflow-hidden rounded-md border-2 border-white bg-surface-sunken"
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
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink-700">
                        {order.previewItems.map((item) => `${item.quantity}× ${item.name}`).join(', ')}
                      </p>
                      {order.moreCount > 0 ? (
                        <p className="mt-0.5 text-xs font-semibold text-primary">
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
      )}
    </div>
  )
}
