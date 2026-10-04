import { Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'
import { useOrderByNumber } from '@/features/orders/queries'
import { formatDate, formatPrice } from '@/lib/utils'

export default function TrackOrderPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { data: order, isLoading, isFetched } = useOrderByNumber(submitted || undefined)

  if (!user) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-h2 text-content">Track your order</h1>
        <p className="mt-2 text-ink-600">Sign in to look up an order by its order number.</p>
        <Link to="/login?redirect=/track" className="mt-6 text-sm font-medium text-iris-700 hover:text-iris-900">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page max-w-2xl py-10 lg:py-14">
      <h1 className="text-h1 text-content">Track Order</h1>
      <p className="mt-2 text-ink-600">Enter your order number (e.g. DHJ-2026-001000).</p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(query.trim())
        }}
        className="mt-6 flex gap-3"
      >
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="DHJ-2026-001000" />
        <button
          type="submit"
          className="flex h-11 shrink-0 items-center gap-2 rounded-card bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover"
        >
          <Search className="size-4" />
          Track
        </button>
      </form>

      {isLoading ? <p className="mt-6 text-sm text-content-muted">Looking up order…</p> : null}

      {isFetched && !order ? (
        <p className="mt-6 text-sm text-danger">
          No order found with that number on your account.
        </p>
      ) : null}

      {order ? (
        <div className="mt-8 rounded-card border border-border-subtle bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-content">{order.orderNumber}</p>
              <p className="text-xs text-content-muted">
                {formatDate(order.placedAt ?? order.createdAt)} · {formatPrice(order.total)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-6">
            <OrderStatusTimeline events={order.statusEvents} />
          </div>
          <Link
            to={`/account/orders/${order.id}`}
            className="mt-4 inline-block text-sm font-medium text-iris-700 hover:text-iris-900"
          >
            View full order
          </Link>
        </div>
      ) : null}
    </div>
  )
}
