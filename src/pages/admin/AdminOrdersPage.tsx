import { useAdminOrders, useUpdateOrderStatus } from '@/features/admin/queries'
import { formatDate, formatPrice } from '@/lib/utils'
import type { OrderStatus } from '@/types/order'

const STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useAdminOrders()
  const updateStatus = useUpdateOrderStatus()

  return (
    <div>
      <h1 className="text-h2 text-content">Orders</h1>

      <div className="mt-6 overflow-x-auto rounded-card border border-border-subtle bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle bg-surface text-left text-xs text-content-muted uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-content-muted">
                  Loading…
                </td>
              </tr>
            ) : !orders?.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-content-muted">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-content">{order.orderNumber}</p>
                    <p className="text-xs text-content-muted">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {order.customerName || order.customerEmail || '—'}
                  </td>
                  <td className="px-4 py-3 text-content">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-ink-600 capitalize">{order.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus.mutate({ orderId: order.id, status: e.target.value as OrderStatus })
                      }
                      className="h-9 rounded-sm border border-border-strong bg-card px-2.5 text-xs focus:border-iris-600 focus:outline-none"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
