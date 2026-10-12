import {
  ArrowLeft,
  Calculator,
  LayoutGrid,
  ListTree,
  Mail,
  Menu,
  Package,
  ShoppingCart,
  Star,
  Ticket,
  Truck,
  UserCog,
  Warehouse,
  X,
  type LucideIcon,
} from 'lucide-react'
import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useProfile } from '@/features/account/queries'
import { useAuth } from '@/features/auth/AuthProvider'
import { DURATION, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

type NavItem = { to: string; label: string; icon: LucideIcon; end: boolean }

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true }],
  },
  {
    title: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package, end: false },
      { to: '/admin/categories', label: 'Categories', icon: ListTree, end: false },
      { to: '/admin/inventory', label: 'Inventory', icon: Warehouse, end: false },
    ],
  },
  {
    title: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
      { to: '/admin/calculator', label: 'Sheet calculator', icon: Calculator, end: false },
      { to: '/admin/coupons', label: 'Promo codes', icon: Ticket, end: false },
      { to: '/admin/shipping', label: 'Shipping', icon: Truck, end: false },
    ],
  },
  {
    title: 'Customers',
    items: [
      { to: '/admin/reviews', label: 'Reviews', icon: Star, end: false },
      { to: '/admin/messages', label: 'Messages', icon: Mail, end: false },
    ],
  },
  {
    title: 'Settings',
    items: [{ to: '/admin/admins', label: 'Manage admins', icon: UserCog, end: false }],
  },
]

const NAV = NAV_GROUPS.flatMap((group) => group.items)

/** `indicatorId` must differ per rendered copy (sidebar vs drawer) so their highlights animate independently. */
function NavItems({ onNavigate, indicatorId }: { onNavigate?: () => void; indicatorId: string }) {
  return (
    <nav className="space-y-5 px-3" aria-label="Admin sections">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.16em] text-content-subtle uppercase">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-(--duration-fast)',
                    isActive ? 'text-on-primary' : 'text-ink-700 hover:bg-surface-sunken hover:text-content',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      // Shared layout id: the highlight glides to the newly active item.
                      <m.span
                        layoutId={indicatorId}
                        className="absolute inset-0 rounded-md bg-iris-800 shadow-[0_6px_16px_-6px_rgb(60_39_130/0.5)]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <item.icon
                      className={cn(
                        'relative size-4 transition-transform duration-(--duration-base) ease-[var(--ease-out-expo)]',
                        !isActive && 'group-hover:translate-x-0.5',
                      )}
                    />
                    <span className="relative">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <Link to="/admin" className="flex items-center gap-2.5 p-5">
      <img src="/logo-mark.svg" alt="" className="size-9 rounded-pill object-cover" />
      <span className="leading-tight">
        <span className="block text-sm font-bold text-content">Laghara Admin</span>
        <span className="block text-[11px] text-content-muted">Store control centre</span>
      </span>
    </Link>
  )
}

function ProfileChip() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const name = profile?.fullName || user?.email || 'Admin'
  return (
    <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-primary text-xs font-bold text-on-primary">
        {name.trim().charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-content">{name}</span>
        <span className="block text-[11px] text-content-muted">Administrator</span>
      </span>
    </div>
  )
}

function BackToStore({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:bg-surface-sunken hover:text-content"
    >
      <ArrowLeft className="size-4" /> Back to store
    </Link>
  )
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const current = NAV.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  )

  return (
    <div className="flex min-h-dvh bg-surface-sunken">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border-subtle bg-card lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto pb-4">
          <NavItems indicatorId="admin-nav-desktop" />
        </div>
        <div className="space-y-2 border-t border-border-subtle p-3">
          <BackToStore />
          <ProfileChip />
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-ink-950/40 transition-opacity duration-200 lg:hidden',
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-card pb-6 shadow-float transition-transform duration-200 ease-[var(--ease-out-soft)] lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Admin navigation"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div className="flex items-start justify-between">
          <Brand />
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="m-3 rounded-pill p-2 text-ink-700 hover:bg-surface-sunken"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <NavItems indicatorId="admin-nav-drawer" onNavigate={() => setDrawerOpen(false)} />
        <div className="mt-5 space-y-2 border-t border-border-subtle px-3 pt-3">
          <BackToStore onNavigate={() => setDrawerOpen(false)} />
          <ProfileChip />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border-subtle bg-card/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-pill p-2 text-ink-800 hover:bg-surface-sunken"
            aria-label="Open admin menu"
            aria-expanded={drawerOpen}
          >
            <Menu className="size-5" />
          </button>
          <p className="truncate text-sm font-semibold text-content">{current?.label ?? 'Admin'}</p>
        </div>
        {/* Keyed by path so each admin page fades in on navigation. */}
        <m.div
          key={location.pathname}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.base, ease: EASE.expo }}
          className="mx-auto max-w-[1400px] p-4 sm:p-5 lg:p-8"
        >
          <Outlet />
        </m.div>
      </div>
    </div>
  )
}
