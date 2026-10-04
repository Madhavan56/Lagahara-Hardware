import {
  LayoutGrid,
  ListTree,
  Mail,
  Package,
  ShoppingCart,
  Star,
  Ticket,
  Truck,
  Warehouse,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/categories', label: 'Categories', icon: ListTree, end: false },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
  { to: '/admin/shipping', label: 'Shipping', icon: Truck, end: false },
  { to: '/admin/coupons', label: 'Promo codes', icon: Ticket, end: false },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, end: false },
  { to: '/admin/messages', label: 'Messages', icon: Mail, end: false },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-dvh bg-surface-sunken">
      <aside className="hidden w-60 shrink-0 border-r border-border-subtle bg-card lg:block">
        <div className="p-5">
          <p className="text-h3 text-content">Admin</p>
          <p className="text-xs text-content-muted">Laghara Hardwares</p>
        </div>
        <nav className="space-y-0.5 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-iris-800 text-ink-50' : 'text-ink-700 hover:bg-surface-sunken',
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <div className="border-b border-border-subtle bg-card px-5 py-3 lg:hidden">
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-sm px-3 py-1.5 text-xs font-medium whitespace-nowrap',
                    isActive ? 'bg-iris-800 text-ink-50' : 'text-ink-700',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-5 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
