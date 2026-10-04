import { AlertTriangle, Package, ShoppingCart, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAdminOrders, useAdminProducts, useAdminReviews } from '@/features/admin/queries'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { formatPrice } from '@/lib/utils'

function StatCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Package
  label: string
  value: ReactNode
  to: string
}) {
  return (
    <Link
      to={to}
      className="rounded-card border border-border-subtle bg-card p-5 transition-colors hover:border-iris-300"
    >
      <Icon className="size-5 text-iris-700" />
      <p className="mt-3 text-2xl font-semibold text-content">{value}</p>
      <p className="text-sm text-content-muted">{label}</p>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const { data: products } = useAdminProducts()
  const { data: pendingOrders } = useAdminOrders('pending')
  const { data: reviews } = useAdminReviews()

  const lowStockCount = products?.filter((p) => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0).length ?? 0
  const outOfStockCount = products?.filter((p) => p.stockQuantity === 0).length ?? 0
  const pendingReviewCount = reviews?.filter((r) => !r.isApproved).length ?? 0
  const pendingOrdersTotal = pendingOrders?.reduce((sum, o) => sum + o.total, 0) ?? 0

  return (
    <div>
      <h1 className="text-h2 text-content">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Total products" value={products?.length ?? 0} to="/admin/products" />
        <StatCard icon={ShoppingCart} label="Pending orders" value={pendingOrders?.length ?? 0} to="/admin/orders" />
        <StatCard
          icon={AlertTriangle}
          label="Low / out of stock"
          value={
            <>
              <AnimatedNumber value={lowStockCount} /> / <AnimatedNumber value={outOfStockCount} />
            </>
          }
          to="/admin/inventory"
        />
        <StatCard icon={Star} label="Reviews awaiting approval" value={pendingReviewCount} to="/admin/reviews" />
      </div>

      {pendingOrders?.length ? (
        <p className="mt-4 text-sm text-ink-600">
          {formatPrice(pendingOrdersTotal)} in pending orders awaiting fulfillment.
        </p>
      ) : null}
    </div>
  )
}
