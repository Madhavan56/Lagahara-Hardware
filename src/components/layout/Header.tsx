import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock3, Heart, Menu, Search, ShoppingBag, Truck, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCartCount } from '@/features/cart/store'
import { useCartUiStore } from '@/features/cart/uiStore'
import { useCategories } from '@/features/catalog/queries'
import { useWishlistCount } from '@/features/wishlist/store'
import { cn } from '@/lib/utils'
import { CategoryRail } from './CategoryRail'

const PRIMARY_LINKS = [
  { to: '/shop', label: 'Shop All' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const { data: categories = [] } = useCategories()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const cartCount = useCartCount()
  const wishlistCount = useWishlistCount()
  const openCartDrawer = useCartUiStore((state) => state.openDrawer)

  useEffect(() => {
    setMobileOpen(false)
    setShopOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar — delivery promise, in the deep end of the ramp. */}
      <div className="focus-ring-light bg-iris-950 text-center text-xs font-semibold tracking-wide text-iris-100">
        <p className="container-page flex items-center justify-center gap-2 py-2">
          <Truck className="size-3.5 text-iris-300" aria-hidden />
          <span>
            Quick delivery in 2 days · Standard in 4–6 ·{' '}
            <span className="text-iris-300">Trade pricing available</span>
          </span>
        </p>
      </div>

      <div className="relative border-b border-border-subtle bg-card/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4 lg:h-18">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-2 rounded-pill p-2 text-ink-700 transition-colors hover:bg-surface-sunken lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Laghara Hardwares home">
            <img
              src="/logo-mark.svg"
              alt="Laghara Hardwares logo icon"
              className="h-10 w-10 rounded-md object-cover shadow-xs lg:h-12 lg:w-12"
            />
            <div className="leading-none">
              <span className="block font-display text-xl font-extrabold tracking-tight text-content lg:text-2xl">
                Laghara
              </span>
              <span className="text-label mt-0.5 block text-primary uppercase">Hardwares</span>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onMouseEnter={() => setShopOpen(true)}
              onClick={() => setShopOpen((open) => !open)}
              className={cn(
                'rounded-pill px-4 py-2 text-sm font-bold transition-colors',
                shopOpen
                  ? 'bg-primary-soft text-primary'
                  : 'text-ink-700 hover:bg-surface-sunken hover:text-primary',
              )}
              aria-expanded={shopOpen}
            >
              Categories
            </button>
            {PRIMARY_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-pill px-4 py-2 text-sm font-bold transition-colors',
                    isActive
                      ? 'bg-primary-soft text-primary'
                      : 'text-ink-700 hover:bg-surface-sunken hover:text-primary',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-content-subtle" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search plywood, hinges, handles…"
                aria-label="Search products"
                className="h-11 w-full rounded-pill border border-transparent bg-surface-sunken pr-4 pl-11 text-sm transition-colors placeholder:text-content-subtle focus:border-primary focus:bg-card focus:outline-none"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link
              to="/wishlist"
              className="relative rounded-pill p-2.5 text-ink-700 transition-colors hover:bg-surface-sunken hover:text-primary"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 ? (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="absolute -top-0.5 -right-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-pill bg-pill-best px-1 text-[0.625rem] leading-none font-bold text-on-primary"
                >
                  {wishlistCount}
                </motion.span>
              ) : null}
            </Link>
            <Link
              to="/account"
              className="rounded-pill p-2.5 text-ink-700 transition-colors hover:bg-surface-sunken hover:text-primary"
              aria-label="Account"
            >
              <User className="size-5" />
            </Link>
            <button
              type="button"
              onClick={openCartDrawer}
              className="relative rounded-pill p-2.5 text-ink-700 transition-colors hover:bg-surface-sunken hover:text-primary"
              aria-label="Cart"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 ? (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  aria-live="polite"
                  aria-label={`${cartCount} ${cartCount === 1 ? 'item' : 'items'} in cart`}
                  className="cart-badge"
                >
                  {cartCount}
                </motion.span>
              ) : null}
            </button>
          </div>
        </div>
      </div>

      {/* Always-visible category rail — one tap to any category */}
      <CategoryRail />

      <AnimatePresence>
        {shopOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onMouseLeave={() => setShopOpen(false)}
            className="absolute inset-x-0 top-full hidden border-b border-border-subtle bg-card shadow-lift lg:block"
          >
            <div className="container-page grid grid-cols-4 gap-x-8 gap-y-1 py-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-primary-soft"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-content group-hover:text-primary">
                      {category.name}
                    </span>
                    {category.description ? (
                      <span className="mt-0.5 line-clamp-1 block text-xs text-content-muted">
                        {category.description}
                      </span>
                    ) : null}
                  </span>
                  <ArrowRight className="ml-3 size-4 shrink-0 -translate-x-1 text-content-subtle opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-surface lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
                <span className="text-h3 text-content">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-pill p-2 text-ink-700 hover:bg-surface-sunken"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="border-b border-border-subtle p-5">
                <form onSubmit={submitSearch}>
                  <div className="relative">
                    <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-content-subtle" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      type="search"
                      placeholder="Search products"
                      aria-label="Search products"
                      className="h-11 w-full rounded-pill border border-border-subtle bg-card pr-4 pl-11 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </form>
              </div>

              <nav className="flex-1 overflow-y-auto p-5">
                <p className="text-label mb-2 text-content-muted uppercase">Shop by category</p>
                <ul className="mb-6 space-y-0.5">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/category/${category.slug}`}
                        className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-bold text-ink-800 hover:bg-primary-soft hover:text-primary"
                      >
                        {category.name}
                        <ArrowRight className="size-4 text-content-subtle" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-0.5 border-t border-border-subtle pt-4">
                  {PRIMARY_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="block rounded-md px-3 py-2.5 text-sm font-bold text-ink-800 hover:bg-primary-soft hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-border-subtle bg-card p-5">
                <div className="flex items-center gap-2 text-xs font-medium text-content-muted">
                  <Clock3 className="size-4 text-primary" aria-hidden />
                  Quick delivery in 2 days on all in-stock items
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
