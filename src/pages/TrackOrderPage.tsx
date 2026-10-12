import { Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'
import { useOrderByNumber } from '@/features/orders/queries'
import { formatDate, formatPrice } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTitle } from '@/components/motion/page-title'
import { AnimatePresence, m } from 'framer-motion'
import { EASE } from '@/lib/motion'

export default function TrackOrderPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { data: order, isLoading, isFetched } = useOrderByNumber(submitted || undefined)

  if (!user) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <PageTitle className="text-h2 text-content" text="Track your order" accent={false} />
        <p className="mt-2 text-ink-600">Sign in to look up an order by its order number.</p>
        <Link to="/login?redirect=/track" className="mt-6 text-sm font-medium text-iris-700 hover:text-iris-900">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page max-w-2xl py-10 lg:py-14">
      <PageTitle className="text-h1 text-content" text="Track order" />
      <p className="mt-2 text-ink-600">Enter your order number (e.g. DHJ-2026-001000).</p>

      <m.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE.expo }}
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(query.trim())
        }}
        className="mt-6 flex gap-3"
      >
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="DHJ-2026-001000" />
        <button
          type="submit"
          className="sheen-sweep flex h-11 shrink-0 items-center gap-2 rounded-card bg-primary px-5 text-sm font-bold text-white transition-[background-color,transform] hover:bg-primary-hover active:scale-[0.97]"
        >
          <Search className="size-4" />
          Track
        </button>
      </m.form>

      {isLoading ? (
        <div role="status" aria-label="Looking up order" className="mt-6 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-24 rounded-card" />
        </div>
      ) : null}

      {isFetched && !order ? (
        <m.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [-8, 6, -4, 2, 0] }} transition={{ duration: 0.45 }} className="mt-6 text-sm text-danger">
          No order found with that number on your account.
        </m.p>
      ) : null}

      <AnimatePresence mode="wait">
      {order ? (
        <m.div
          key={order.id}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.55, ease: EASE.expo }}
          className="mt-8 rounded-card border border-border-subtle bg-card p-6 shadow-card"
        >
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
        </m.div>
      ) : null}
      </AnimatePresence>
    </div>
  )
}
