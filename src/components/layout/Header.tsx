import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCartCount } from '@/features/cart/store'
import { useCartUiStore } from '@/features/cart/uiStore'
import { useCategories } from '@/features/catalog/queries'
import { useWishlistCount } from '@/features/wishlist/store'
import { cn } from '@/lib/utils'

const PRIMARY_LINKS = [
  { to: '/shop', label: 'Shop All' },
  { to: '/about', label: 'About' },
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
      <div className="bg-brand-900 text-center text-xs tracking-wide text-brand-100">
        <p className="container-page py-2">
          Trade pricing available · Standard delivery in 4–6 days, Quick delivery in 2
        </p>
      </div>

      <div className="border-b border-sand-200 bg-sand-50/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4 lg:h-20">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-2 rounded-lg p-2 text-sand-700 transition-colors hover:bg-sand-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <Link to="/" className="shrink-0">
            <span className="font-display text-xl leading-none font-semibold tracking-tight text-brand-900 lg:text-2xl">
              Dhuraj
            </span>
            <span className="ml-1 font-display text-xl leading-none text-brass-600 lg:text-2xl">
              Interiors
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onMouseEnter={() => setShopOpen(true)}
              onClick={() => setShopOpen((open) => !open)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                shopOpen ? 'bg-sand-100 text-brand-800' : 'text-sand-700 hover:text-brand-800',
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
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'text-brand-800' : 'text-sand-700 hover:text-brand-800',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-sand-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search plywood, hinges, handles…"
                aria-label="Search products"
                className="h-10 w-full rounded-full border border-sand-300 bg-white pl-10 pr-4 text-sm transition-colors placeholder:text-sand-400 focus:border-brand-600 focus:outline-none"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link
              to="/wishlist"
              className="relative rounded-lg p-2.5 text-sand-700 transition-colors hover:bg-sand-100 hover:text-brand-800"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 ? (
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-brass-500 text-[0.625rem] font-semibold text-sand-950">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link
              to="/account"
              className="rounded-lg p-2.5 text-sand-700 transition-colors hover:bg-sand-100 hover:text-brand-800"
              aria-label="Account"
            >
              <User className="size-5" />
            </Link>
            <button
              type="button"
              onClick={openCartDrawer}
              className="relative rounded-lg p-2.5 text-sand-700 transition-colors hover:bg-sand-100 hover:text-brand-800"
              aria-label="Cart"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 ? (
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-brass-500 text-[0.625rem] font-semibold text-sand-950">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {shopOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onMouseLeave={() => setShopOpen(false)}
              className="absolute inset-x-0 hidden border-b border-sand-200 bg-white shadow-lift lg:block"
            >
              <div className="container-page grid grid-cols-4 gap-x-8 gap-y-1 py-8">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="group rounded-lg px-3 py-2.5 transition-colors hover:bg-sand-50"
                  >
                    <span className="block text-sm font-medium text-sand-900 group-hover:text-brand-800">
                      {category.name}
                    </span>
                    {category.description ? (
                      <span className="mt-0.5 block line-clamp-1 text-xs text-sand-500">
                        {category.description}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-sand-950/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-sand-50 lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
                <span className="font-display text-lg font-semibold text-brand-900">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-sand-700 hover:bg-sand-100"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="border-b border-sand-200 p-5">
                <form onSubmit={submitSearch}>
                  <div className="relative">
                    <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-sand-500" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      type="search"
                      placeholder="Search products"
                      aria-label="Search products"
                      className="h-11 w-full rounded-xl border border-sand-300 bg-white pl-10 pr-4 text-sm focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                </form>
              </div>

              <nav className="flex-1 overflow-y-auto p-5">
                <p className="mb-2 text-xs font-semibold tracking-widest text-sand-500 uppercase">
                  Categories
                </p>
                <ul className="mb-6 space-y-0.5">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/category/${category.slug}`}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-sand-800 hover:bg-sand-100"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-0.5 border-t border-sand-200 pt-4">
                  {PRIMARY_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-sand-800 hover:bg-sand-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
