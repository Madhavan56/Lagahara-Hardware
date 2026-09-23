import { motion } from 'framer-motion'
import { ArrowRight, Clock3, ShieldCheck, Truck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CategoryTile } from '@/components/catalog/CategoryTile'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories, useFeaturedProducts, useNewArrivals } from '@/features/catalog/queries'
import { useDocumentHead } from '@/hooks/useDocumentHead'

const TRUST_POINTS = [
  { icon: Zap, label: 'Quick delivery in 2 days' },
  { icon: ShieldCheck, label: 'Genuine, authorised brands' },
  { icon: Truck, label: 'Trade to project quantities' },
]

const PROJECT_PATHS = [
  { label: 'Kitchen fit-out', detail: 'Baskets, hinges and organisers', slug: 'kitchen-hardware' },
  { label: 'Wardrobe build', detail: 'Rails, runners and handles', slug: 'wardrobe-hardware' },
  { label: 'Cabinet finishing', detail: 'Laminates, pulls and profiles', slug: 'mica-laminates' },
  { label: 'Build essentials', detail: 'Plywood for every application', slug: 'plywood' },
]

const BUDGET_LINKS = [
  { label: 'Best value', query: 'sort=price_asc' },
  { label: 'New stock', query: 'sort=newest' },
  { label: 'Top rated', query: 'sort=rating' },
  { label: 'Premium picks', query: 'sort=price_desc' },
]

export default function HomePage() {
  const { data: categories, isLoading, isError } = useCategories()
  const featured = useFeaturedProducts(8)
  const newArrivals = useNewArrivals(8)

  useDocumentHead({
    title: 'Laghara Hardwares — Interior & Furniture Materials',
    description:
      'Plywood, laminates, kitchen and wardrobe hardware, hinges, drawer systems, handles and more. Trade-grade interior materials with fast delivery.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Laghara Hardwares',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  })

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-sand-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgb(255 255 255 / 0.35), transparent 40%), radial-gradient(circle at 85% 85%, rgb(240 85 5 / 0.35), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="container-page relative py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-sand-100 ring-1 ring-white/15 backdrop-blur-sm">
              <Clock3 className="size-3.5 text-brass-300" />
              Quick delivery in 2 days · Standard in 4–6
            </div>
            <h1 className="max-w-xl text-4xl leading-[1.05] font-extrabold text-white sm:text-5xl lg:text-6xl">
              Everything for the build, delivered fast.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 lg:text-lg">
              Plywood, laminates and every fitting in between — thirteen categories of trade-grade
              material, in stock and ready to ship.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex h-13 items-center gap-2 rounded-2xl bg-brass-500 px-7 text-base font-bold text-white shadow-float transition-all hover:bg-brass-600 active:scale-95"
              >
                Shop all products
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-13 items-center rounded-2xl border border-white/25 bg-white/5 px-7 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Talk to us
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_POINTS.map((point) => (
                <div key={point.label} className="flex items-center gap-1.5 text-sm font-medium text-white/85">
                  <point.icon className="size-4 text-brass-300" />
                  {point.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-8 lg:py-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-sand-900 lg:text-2xl">Shop by category</h2>
            <p className="mt-0.5 text-sm text-sand-500">Thirteen aisles, one tap away.</p>
          </div>
          <Link to="/shop" className="text-sm font-bold text-brass-600 hover:text-brass-700">
            View all
          </Link>
        </div>

        {isError ? (
          <p className="rounded-panel border border-sand-200 bg-white p-6 text-sm text-sand-600">
            Categories could not be loaded. Confirm the database migrations have been applied.
          </p>
        ) : isLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-card" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.025 } } }}
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-4"
          >
            {categories?.map((category) => (
              <motion.div
                key={category.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <CategoryTile category={category} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="border-y border-sand-200 bg-sand-100 py-8 lg:py-10">
        <div className="container-page">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-brass-600 uppercase">Start with the room</p>
              <h2 className="mt-1 text-xl font-extrabold text-sand-900 lg:text-2xl">Plan the whole fit-out</h2>
            </div>
            <Link to="/shop" className="text-sm font-bold text-brass-600 hover:text-brass-700">Browse all</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROJECT_PATHS.map((path) => (
              <Link
                key={path.slug}
                to={`/category/${path.slug}`}
                className="group rounded-card border border-sand-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brass-300 hover:shadow-card"
              >
                <span className="text-base font-extrabold text-sand-900 group-hover:text-brand-800">{path.label}</span>
                <span className="mt-1 block text-sm text-sand-500">{path.detail}</span>
                <span className="mt-4 block text-xs font-bold text-brass-600">Shop collection →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-sand-200 bg-white py-8 lg:py-12">
        <div className="container-page">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-sand-900 lg:text-2xl">Featured</h2>
              <p className="mt-0.5 text-sm text-sand-500">Specified by pros, stocked deep.</p>
            </div>
            <Link to="/shop" className="text-sm font-bold text-brass-600 hover:text-brass-700">
              Shop all
            </Link>
          </div>
          <ProductGrid products={featured.data} isLoading={featured.isLoading} isError={featured.isError} />
        </div>
      </section>

      <section className="container-page py-8 lg:py-12">
        <div className="flex flex-col gap-5 rounded-panel bg-brand-900 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-brass-300 uppercase">Shop smart</p>
            <h2 className="mt-1 text-xl font-extrabold text-white">Find the right piece for your budget</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {BUDGET_LINKS.map((budget) => (
              <Link
                key={budget.query}
                to={`/shop?${budget.query}`}
                className="rounded-full border border-white/20 px-3.5 py-2 text-sm font-bold text-sand-100 transition-colors hover:border-brass-300 hover:bg-brass-500 hover:text-white"
              >
                {budget.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="container-page">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-sand-900 lg:text-2xl">New arrivals</h2>
              <p className="mt-0.5 text-sm text-sand-500">Fresh on the floor this week.</p>
            </div>
          </div>
          <ProductGrid products={newArrivals.data} isLoading={newArrivals.isLoading} isError={newArrivals.isError} />
        </div>
      </section>
    </>
  )
}
