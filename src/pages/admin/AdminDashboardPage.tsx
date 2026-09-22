import { AlertTriangle, Package, ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminOrders, useAdminProducts, useAdminReviews } from '@/features/admin/queries'
import { formatPrice } from '@/lib/utils'

function StatCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Package
  label: string
  value: string | number
  to: string
}) {
  return (
    <Link
      to={to}
      className="rounded-card border border-sand-200 bg-white p-5 transition-colors hover:border-brand-300"
    >
      <Icon className="size-5 text-brand-700" />
      <p className="mt-3 text-2xl font-semibold text-sand-900">{value}</p>
      <p className="text-sm text-sand-500">{label}</p>
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
      <h1 className="font-display text-2xl font-semibold text-sand-900">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Total products" value={products?.length ?? 0} to="/admin/products" />
        <StatCard icon={ShoppingCart} label="Pending orders" value={pendingOrders?.length ?? 0} to="/admin/orders" />
        <StatCard icon={AlertTriangle} label="Low / out of stock" value={`${lowStockCount} / ${outOfStockCount}`} to="/admin/inventory" />
        <StatCard icon={Star} label="Reviews awaiting approval" value={pendingReviewCount} to="/admin/reviews" />
      </div>

      {pendingOrders?.length ? (
        <p className="mt-4 text-sm text-sand-600">
          {formatPrice(pendingOrdersTotal)} in pending orders awaiting fulfillment.
        </p>
      ) : null}
    </div>
  )
}
