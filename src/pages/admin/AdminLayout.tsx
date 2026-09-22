import {
  LayoutGrid,
  ListTree,
  Package,
  ShoppingCart,
  Star,
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
  { to: '/admin/reviews', label: 'Reviews', icon: Star, end: false },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-dvh bg-sand-100">
      <aside className="hidden w-60 shrink-0 border-r border-sand-200 bg-white lg:block">
        <div className="p-5">
          <p className="font-display text-lg font-semibold text-brand-900">Admin</p>
          <p className="text-xs text-sand-500">Dhuraj Interiors</p>
        </div>
        <nav className="space-y-0.5 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-800 text-sand-50' : 'text-sand-700 hover:bg-sand-100',
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
        <div className="border-b border-sand-200 bg-white px-5 py-3 lg:hidden">
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap',
                    isActive ? 'bg-brand-800 text-sand-50' : 'text-sand-700',
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
