import { m, useReducedMotion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageTitle } from '@/components/motion/page-title'
import { DURATION, EASE } from '@/lib/motion'
import { useAuth } from '@/features/auth/AuthProvider'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/account', label: 'Profile', end: true },
  { to: '/account/addresses', label: 'Addresses', end: false },
  { to: '/account/orders', label: 'Orders', end: false },
]

export default function AccountLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const reduce = useReducedMotion()

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true, state: { authMessage: 'You have been logged out successfully.' } })
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <PageTitle className="text-h1 text-content" text="My account" />
      <p className="mt-1 text-sm text-content-muted">{user?.email}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'relative rounded-sm px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive ? 'text-ink-50' : 'text-ink-700 hover:bg-surface-sunken',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <m.span
                      layoutId="account-tab"
                      className="absolute inset-0 rounded-sm bg-iris-800"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-sm px-3.5 py-2.5 text-left text-sm font-medium whitespace-nowrap text-ink-700 hover:bg-surface-sunken lg:mt-4"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </nav>

        <m.div
          key={location.pathname}
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DURATION.base, ease: EASE.expo }}
        >
          <Outlet />
        </m.div>
      </div>
    </div>
  )
}
