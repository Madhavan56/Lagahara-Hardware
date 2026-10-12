import { m, useReducedMotion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  IndianRupee,
  PackageCheck,
  Plus,
  RefreshCw,
  ShoppingCart,
  Star,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart'
import { StatusBreakdown } from '@/components/admin/dashboard/StatusBreakdown'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { useProfile } from '@/features/account/queries'
import { DASHBOARD_DAYS } from '@/features/admin/api'
import { useAdminProducts, useAdminReviews, useDashboard } from '@/features/admin/queries'
import { stockStatus } from '@/features/admin/stock'
import { useAuth } from '@/features/auth/AuthProvider'
import { DURATION, EASE, fadeUp, staggerParent, STAGGER } from '@/lib/motion'
import { cn, formatPrice } from '@/lib/utils'

const RESTOCK_LIMIT = 6
const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const orderTime = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

function greeting(date: Date) {
  const hour = date.getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

function useSecondsSince(timestamp: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  return Math.max(0, Math.round((now - timestamp) / 1000))
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <m.section
      variants={fadeUp}
      className={cn('flex flex-col rounded-card border border-border-subtle bg-card shadow-xs', className)}
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h2 className="text-sm font-semibold text-content">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-content-muted">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className="flex-1 p-5">{children}</div>
    </m.section>
  )
}

function PanelLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
    >
      {children}
      <ArrowRight className="size-3 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5" />
    </Link>
  )
}

export default function AdminDashboardPage() {
  const reduce = useReducedMotion()
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const dashboard = useDashboard()
  const { data: products } = useAdminProducts()
  const { data: reviews } = useAdminReviews()
  const secondsAgo = useSecondsSince(dashboard.dataUpdatedAt)

  const data = dashboard.data
  const restock = (products ?? [])
    .filter((p) => p.isActive && stockStatus(p) !== 'in')
    .sort((a, b) => a.stockQuantity / Math.max(1, a.lowStockThreshold) - b.stockQuantity / Math.max(1, b.lowStockThreshold))
  const pendingReviews = reviews?.filter((r) => !r.isApproved).length ?? 0
  const periodRevenue = data?.days.reduce((sum, d) => sum + d.revenue, 0) ?? 0
  const periodOrders = data?.days.reduce((sum, d) => sum + d.orders, 0) ?? 0
  const firstName = profile?.fullName?.split(' ')[0]
  const today = new Date()

  return (
    <m.div initial="hidden" animate="visible" variants={staggerParent(STAGGER.base)} className="space-y-6">
      {/* Header */}
      <m.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="mt-1 text-h2 text-content">
            {greeting(today)}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-1 text-sm text-content-muted">Here's how the store is doing today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-pill border border-border-subtle bg-card px-3 py-1.5 text-xs text-content-muted sm:inline-flex">
            <span className="relative flex size-2">
              {!reduce ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" /> : null}
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Live · {dashboard.dataUpdatedAt ? `updated ${relativeTime.format(-secondsAgo, 'second')}` : 'loading'}
          </span>
          <button
            type="button"
            onClick={() => void dashboard.refetch()}
            className="inline-flex items-center gap-1.5 rounded-pill border border-border-subtle bg-card px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-primary hover:text-primary"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={cn('size-3.5', dashboard.isFetching && 'animate-spin')} />
            Refresh
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3.5 py-1.5 text-xs font-semibold text-on-primary shadow-primary transition-[background-color,transform] hover:bg-primary-hover active:scale-[0.98]"
          >
            <Plus className="size-3.5" /> New product
          </Link>
        </div>
      </m.div>

      {/* KPIs */}
      <m.div variants={staggerParent(STAGGER.tight)} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={ShoppingCart}
          label="Orders today"
          value={data?.ordersToday}
          delta={data ? { current: data.ordersToday, previous: data.ordersYesterday, label: 'yesterday' } : undefined}
          to="/admin/orders"
        />
        <KpiCard
          icon={IndianRupee}
          label="Revenue today"
          value={data?.revenueToday}
          format={(n) => formatPrice(n)}
          delta={data ? { current: data.revenueToday, previous: data.revenueYesterday, label: 'yesterday' } : undefined}
          to="/admin/orders"
        />
        <KpiCard
          icon={PackageCheck}
          label="Orders to fulfil"
          value={data?.toFulfil}
          hint="Confirmed and processing"
          to="/admin/orders"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Low or out of stock"
          value={products ? restock.length : undefined}
          hint="Active products at or below threshold"
          to="/admin/inventory"
          tone="warning"
        />
      </m.div>

      {/* Trend + status */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          title="Revenue"
          subtitle={`Last ${DASHBOARD_DAYS} days · ${formatPrice(periodRevenue)} from ${periodOrders} ${periodOrders === 1 ? 'order' : 'orders'}`}
          action={<PanelLink to="/admin/orders">All orders</PanelLink>}
        >
          {data ? <RevenueChart days={data.days} /> : <div className="h-60 animate-pulse rounded-md bg-surface-sunken" />}
        </Panel>

        <Panel title="Orders by status" subtitle="All time" action={<PanelLink to="/admin/orders">Manage</PanelLink>}>
          {data ? <StatusBreakdown counts={data.statusCounts} /> : <div className="h-40 animate-pulse rounded-md bg-surface-sunken" />}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4">
            <Link to="/admin/orders" className="rounded-md bg-surface p-3 transition-colors hover:bg-primary-soft">
              <Clock className="size-4 text-content-muted" aria-hidden />
              <p className="mt-2 text-lg font-bold text-content tabular-nums">{data?.awaitingPayment ?? '–'}</p>
              <p className="text-xs text-content-muted">Awaiting payment</p>
            </Link>
            <Link to="/admin/reviews" className="rounded-md bg-surface p-3 transition-colors hover:bg-primary-soft">
              <Star className="size-4 text-content-muted" aria-hidden />
              <p className="mt-2 text-lg font-bold text-content tabular-nums">{reviews ? pendingReviews : '–'}</p>
              <p className="text-xs text-content-muted">Reviews to approve</p>
            </Link>
          </div>
        </Panel>
      </div>

      {/* Recent orders + restock */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Recent orders" action={<PanelLink to="/admin/orders">View all</PanelLink>}>
          {!data ? (
            <div className="h-48 animate-pulse rounded-md bg-surface-sunken" />
          ) : data.recentOrders.length === 0 ? (
            <p className="text-sm text-content-muted">No orders yet.</p>
          ) : (
            <ul className="-mx-2">
              {data.recentOrders.map((order, i) => (
                <m.li
                  key={order.id}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: DURATION.slow, delay: 0.3 + i * STAGGER.tight, ease: EASE.expo }}
                >
                  <Link
                    to="/admin/orders"
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-primary-soft text-xs font-bold text-primary">
                      {(order.customerName ?? '?').trim().charAt(0).toUpperCase() || '?'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-content">
                        {order.customerName ?? 'Customer'}
                      </span>
                      <span className="block text-xs text-content-muted">
                        {order.orderNumber} · {orderTime.format(new Date(order.createdAt))}
                      </span>
                    </span>
                    <span className="hidden sm:block">
                      <OrderStatusBadge status={order.status} />
                    </span>
                    <span className="w-20 text-right text-sm font-semibold text-content tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                  </Link>
                </m.li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Needs restocking"
          subtitle={products ? `${restock.length} active ${restock.length === 1 ? 'product' : 'products'} at or below threshold` : undefined}
          action={<PanelLink to="/admin/inventory">Inventory</PanelLink>}
        >
          {!products ? (
            <div className="h-48 animate-pulse rounded-md bg-surface-sunken" />
          ) : restock.length === 0 ? (
            <p className="text-sm text-content-muted">Everything is above its low-stock threshold.</p>
          ) : (
            <ul className="space-y-3.5">
              {restock.slice(0, RESTOCK_LIMIT).map((p, i) => {
                // Bar shows stock against twice the threshold, so "at threshold" sits halfway.
                const capacity = Math.max(1, p.lowStockThreshold * 2)
                const fill = Math.min(1, p.stockQuantity / capacity)
                const out = p.stockQuantity === 0
                return (
                  <li key={p.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <Link to={`/admin/products/${p.id}`} className="min-w-0 truncate text-content hover:text-primary">
                        {p.name}
                      </Link>
                      <span className={cn('shrink-0 text-xs font-semibold tabular-nums', out ? 'text-danger' : 'text-warning')}>
                        {out ? 'Out of stock' : `${p.stockQuantity} left · min ${p.lowStockThreshold}`}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-surface-sunken">
                      <m.div
                        className={cn('h-full origin-left rounded-pill', out ? 'bg-danger' : 'bg-warning')}
                        style={{ width: `${Math.max(fill * 100, out ? 0 : 4)}%` }}
                        initial={reduce ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.35 + i * STAGGER.tight, ease: EASE.expo }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {restock.length > RESTOCK_LIMIT ? (
            <p className="mt-4 text-xs text-content-muted">+{restock.length - RESTOCK_LIMIT} more in inventory</p>
          ) : null}
        </Panel>
      </div>
    </m.div>
  )
}
