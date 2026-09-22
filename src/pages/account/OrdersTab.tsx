import { PackageSearch } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { useMyOrders } from '@/features/orders/queries'
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
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            to={`/account/orders/${order.id}`}
            className="flex items-center justify-between gap-4 rounded-card border border-sand-200 bg-white p-4 transition-colors hover:border-brand-300"
          >
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
          </Link>
        </li>
      ))}
    </ul>
  )
}
