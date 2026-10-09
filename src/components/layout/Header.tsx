import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { ArrowRight, Clock3, Heart, Search, ShoppingBag, Truck, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCartCount } from '@/features/cart/store'
import { useCartUiStore } from '@/features/cart/uiStore'
import { useCategories } from '@/features/catalog/queries'
import { useWishlistCount } from '@/features/wishlist/store'
import { useScrollHeader } from '@/hooks/useScrollHeader'
import { DURATION, EASE, SPRING, STAGGER } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { CategoryRail } from './CategoryRail'

const PRIMARY_LINKS = [
  { to: '/shop', label: 'Shop all' },
  { to: '/contact', label: 'Contact' },
]

const ICON_BUTTON =
  'relative rounded-pill p-2.5 text-ink-700 transition-[background-color,color,transform] duration-(--duration-fast) hover:bg-surface-sunken hover:text-primary active:scale-95'

/*
  Layout (high-end-visual-design "Fluid Island" nav):
    - announcement bar and category rail sit in normal page flow and scroll away
    - the main bar is a floating glass pill, detached from the viewport edges,
      and is the only sticky part. Its shadow deepens once the page scrolls.
    - on phones the menu opens as a full-screen glass overlay beneath the
      pill; the hamburger morphs into an X and the links rise in sequence.
*/
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
  const scrolled = useScrollHeader()
  const reduce = useReducedMotion()

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

  // Links in the mobile overlay rise from below, one after another.
  const rise = (index: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 48 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.slow + 0.1, ease: EASE.fluid, delay: 0.08 + Math.min(index, 12) * STAGGER.base },
  })

  // Rendered as siblings (not inside one wrapper) so the sticky island sticks
  // for the whole page: a sticky element only sticks within its parent.
  return (
    <>
      {/* Announcement bar: delivery promise, in the deep end of the ramp. */}
      <div className="focus-ring-light bg-iris-950 text-center text-xs font-semibold tracking-wide text-iris-100">
        <p className="container-page flex items-center justify-center gap-2 py-2">
          <Truck className="size-3.5 text-iris-300" aria-hidden />
          <span>
            Quick delivery in 2 days, standard in 4 to 6 ·{' '}
            <span className="text-iris-300">Trade pricing available</span>
          </span>
        </p>
      </div>

      <header className="sticky top-0 z-50 pt-2 lg:pt-3">
        <div className="container-page relative z-[2]">
          {/* The floating island. backdrop-blur is fine here: the pill is sticky, not scrolling content. */}
          <div
            className={cn(
              'flex h-14 items-center gap-3 rounded-pill bg-card/80 px-2 ring-1 ring-ink-950/[0.06] backdrop-blur-xl transition-shadow duration-(--duration-slow) ease-[var(--ease-fluid)] lg:h-16 lg:gap-4 lg:px-3',
              scrolled || mobileOpen
                ? 'shadow-[0_8px_32px_-8px_rgb(60_39_130/0.18),inset_0_1px_1px_rgb(255_255_255/0.6)]'
                : 'shadow-[0_1px_2px_rgb(60_39_130/0.04),inset_0_1px_1px_rgb(255_255_255/0.6)]',
            )}
          >
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="relative size-10 shrink-0 rounded-pill text-ink-800 transition-colors hover:bg-surface-sunken lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {/* Hamburger: two lines that rotate into an X. */}
              <span
                aria-hidden
                className={cn(
                  'absolute left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-pill bg-current transition-transform duration-(--duration-slow) ease-[var(--ease-fluid)]',
                  mobileOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[calc(50%-4px)]',
                )}
              />
              <span
                aria-hidden
                className={cn(
                  'absolute left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-pill bg-current transition-transform duration-(--duration-slow) ease-[var(--ease-fluid)]',
                  mobileOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'top-[calc(50%+3px)]',
                )}
              />
            </button>

            {/* The visible wordmark is the link name; "home" is added for screen readers only. */}
            <Link to="/" className="flex shrink-0 items-center gap-2.5 lg:pl-1">
              <img src="/logo-mark.svg" alt="" className="size-9 rounded-pill object-cover lg:size-10" />
              <div className="leading-none">
                <span className="block font-display text-lg font-extrabold tracking-tight text-content lg:text-xl">
                  Laghara
                </span>
                <span className="text-label mt-0.5 block text-primary uppercase">Hardwares</span>
                <span className="sr-only">, home</span>
              </div>
            </Link>

            <nav className="ml-4 hidden items-center gap-1 lg:flex">
              <button
                type="button"
                onMouseEnter={() => setShopOpen(true)}
                onClick={() => setShopOpen((open) => !open)}
                className={cn(
                  'rounded-pill px-4 py-2 text-sm font-bold transition-colors',
                  shopOpen ? 'bg-primary-soft text-primary' : 'text-ink-700 hover:bg-surface-sunken hover:text-primary',
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
                      isActive ? 'bg-primary-soft text-primary' : 'text-ink-700 hover:bg-surface-sunken hover:text-primary',
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
                  className="h-11 w-full rounded-pill border border-transparent bg-surface-sunken/80 pr-4 pl-11 text-sm transition-[border-color,background-color,box-shadow] duration-(--duration-fast) placeholder:text-content-subtle focus:border-primary focus:bg-card focus:shadow-[0_0_0_4px_rgb(108_77_217/0.14)] focus:outline-none"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-0.5 md:ml-0">
              <Link to="/wishlist" className={cn(ICON_BUTTON, 'hidden sm:block')} aria-label="Wishlist">
                <Heart className="size-5" />
                {wishlistCount > 0 ? (
                  <m.span
                    key={wishlistCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={SPRING}
                    className="absolute -top-0.5 -right-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-pill bg-pill-best px-1 text-[0.625rem] leading-none font-bold text-on-primary"
                  >
                    {wishlistCount}
                  </m.span>
                ) : null}
              </Link>
              <Link to="/account" className={ICON_BUTTON} aria-label="Account">
                <User className="size-5" />
              </Link>
              <button type="button" onClick={openCartDrawer} className={ICON_BUTTON} aria-label="Cart">
                <ShoppingBag className="size-5" />
                {cartCount > 0 ? (
                  // Keyed on the count so the badge bumps every time an item is added.
                  <m.span
                    key={cartCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [1.35, 1], opacity: 1 }}
                    transition={SPRING}
                    aria-live="polite"
                    aria-label={`${cartCount} ${cartCount === 1 ? 'item' : 'items'} in cart`}
                    className="cart-badge"
                  >
                    {cartCount}
                  </m.span>
                ) : null}
              </button>
            </div>
          </div>

          {/* Desktop category panel: a floating glass sheet under the island. */}
          <AnimatePresence>
            {shopOpen ? (
              <m.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: DURATION.base, ease: EASE.fluid }}
                onMouseLeave={() => setShopOpen(false)}
                className="absolute inset-x-4 top-full mt-2 hidden origin-top rounded-[2rem] bg-card/90 p-1.5 shadow-float ring-1 ring-ink-950/[0.06] backdrop-blur-xl sm:inset-x-6 lg:block xl:inset-x-10"
              >
                <div className="grid grid-cols-4 gap-x-6 gap-y-1 rounded-[calc(2rem-0.375rem)] bg-card/70 p-6">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors hover:bg-primary-soft"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-content group-hover:text-primary">{category.name}</span>
                        {category.description ? (
                          <span className="mt-0.5 line-clamp-1 block text-xs text-content-muted">{category.description}</span>
                        ) : null}
                      </span>
                      <ArrowRight className="ml-3 size-4 shrink-0 -translate-x-1 text-content-subtle opacity-0 transition-[transform,opacity,color] duration-(--duration-base) ease-[var(--ease-fluid)] group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Mobile menu: full-screen glass overlay that sits beneath the island. */}
        <AnimatePresence>
          {mobileOpen ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: DURATION.base } }}
              transition={{ duration: DURATION.slow, ease: EASE.fluid }}
              className="fixed inset-0 z-[1] flex flex-col overflow-y-auto bg-card/85 px-4 pt-24 pb-[calc(1.5rem+env(safe-area-inset-bottom))] backdrop-blur-3xl lg:hidden"
            >
              <m.form {...rise(0)} onSubmit={submitSearch}>
                <div className="relative">
                  <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-content-subtle" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    type="search"
                    placeholder="Search products"
                    aria-label="Search products"
                    className="h-12 w-full rounded-pill border border-border-subtle bg-card pr-4 pl-11 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </m.form>

              <nav className="mt-8 flex-1" aria-label="Menu">
                <ul className="space-y-1">
                  {PRIMARY_LINKS.map((link, index) => (
                    <m.li key={link.to} {...rise(index + 1)}>
                      <Link to={link.to} className="block py-1.5 text-3xl font-extrabold tracking-tight text-content transition-colors active:text-primary">
                        {link.label}
                      </Link>
                    </m.li>
                  ))}
                </ul>

                <m.p {...rise(PRIMARY_LINKS.length + 1)} className="mt-8 mb-2 text-sm font-bold text-content-muted">
                  Shop by category
                </m.p>
                <ul className="grid grid-cols-2 gap-x-4">
                  {categories.map((category, index) => (
                    <m.li key={category.id} {...rise(PRIMARY_LINKS.length + 2 + index)}>
                      <Link
                        to={`/category/${category.slug}`}
                        className="flex items-center justify-between border-b border-ink-950/[0.06] py-3 text-sm font-bold text-ink-800 active:text-primary"
                      >
                        <span className="truncate">{category.name}</span>
                        <ArrowRight className="size-4 shrink-0 text-content-subtle" />
                      </Link>
                    </m.li>
                  ))}
                </ul>
                <m.div {...rise(PRIMARY_LINKS.length + 2 + categories.length)} className="mt-4">
                  <Link to="/wishlist" className="inline-flex items-center gap-2 py-2 text-sm font-bold text-ink-800 sm:hidden">
                    <Heart className="size-4" /> Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                  </Link>
                </m.div>
              </nav>

              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-content-muted">
                <Clock3 className="size-4 text-primary" aria-hidden />
                Quick delivery in 2 days on all in-stock items
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </header>

      {/* Category rail: one tap to any category from the top of every page. */}
      <CategoryRail />
    </>
  )
}
