import { Link } from 'react-router-dom'
import { useCategories } from '@/features/catalog/queries'

const COMPANY_LINKS = [
  { to: '/about', label: 'About us' },
  { to: '/contact', label: 'Contact' },
  { to: '/shipping-policy', label: 'Shipping policy' },
  { to: '/returns', label: 'Returns' },
]

const ACCOUNT_LINKS = [
  { to: '/account', label: 'My account' },
  { to: '/account/orders', label: 'Order history' },
  { to: '/track', label: 'Track order' },
  { to: '/wishlist', label: 'Wishlist' },
]

export function Footer() {
  const { data: categories = [] } = useCategories()

  return (
    <footer className="mt-24 bg-brand-950 text-sand-300">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="lg:pr-8">
          <p className="font-display text-2xl font-semibold text-sand-50">
            Dhuraj <span className="text-brass-400">Interiors</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-sand-400">
            Interior and furniture materials for builders, carpenters and designers. Trade-grade
            stock, honest pricing, delivered on schedule.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold tracking-widest text-sand-500 uppercase">
            Categories
          </p>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 7).map((category) => (
              <li key={category.id}>
                <Link
                  to={`/category/${category.slug}`}
                  className="transition-colors hover:text-brass-300"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold tracking-widest text-sand-500 uppercase">
            Company
          </p>
          <ul className="space-y-2 text-sm">
            {COMPANY_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-brass-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold tracking-widest text-sand-500 uppercase">
            Account
          </p>
          <ul className="space-y-2 text-sm">
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-brass-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-900">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-sand-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Dhuraj Interiors. All rights reserved.</p>
          <p>All prices are inclusive of GST.</p>
        </div>
      </div>
    </footer>
  )
}
