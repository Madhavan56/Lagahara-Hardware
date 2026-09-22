import { motion } from 'framer-motion'
import { ArrowRight, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories, useFeaturedProducts, useNewArrivals } from '@/features/catalog/queries'

const TRUST_POINTS = [
  { icon: Truck, title: 'Two delivery speeds', body: 'Standard in 4–6 days, or Quick within 2.' },
  { icon: ShieldCheck, title: 'Genuine brands', body: 'Sourced direct from authorised distributors.' },
  { icon: PackageCheck, title: 'Trade quantities', body: 'Single pieces to full-project volumes.' },
]

export default function HomePage() {
  const { data: categories, isLoading, isError } = useCategories()
  const featured = useFeaturedProducts(8)
  const newArrivals = useNewArrivals(8)

  return (
    <>
      <section className="relative overflow-hidden bg-brand-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgb(215 126 22 / 0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgb(31 122 102 / 0.4), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="container-page relative py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-brass-400 uppercase">
              Interior & furniture materials
            </p>
            <h1 className="font-display text-4xl leading-[1.05] font-semibold text-sand-50 sm:text-5xl lg:text-6xl">
              Everything behind a well-built interior.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-sand-300 lg:text-lg">
              Plywood, laminates and the hardware that holds it all together — thirteen categories
              of trade-grade material, specified properly and delivered on time.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/shop" className={buttonVariants({ variant: 'accent', size: 'lg' })}>
                Browse the catalogue
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-13 items-center rounded-xl border border-sand-700 px-7 text-base font-medium text-sand-200 transition-colors hover:border-brass-400 hover:text-brass-300"
              >
                Talk to us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-sand-200 bg-white">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex gap-3.5">
              <point.icon className="size-5 shrink-0 text-brand-700" />
              <div>
                <p className="text-sm font-semibold text-sand-900">{point.title}</p>
                <p className="mt-0.5 text-sm text-sand-600">{point.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16 lg:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-sand-900 lg:text-4xl">
              Shop by category
            </h2>
            <p className="mt-2 text-sand-600">Thirteen categories, specified down to the fitting.</p>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-800"
          >
            View everything
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {isError ? (
          <p className="rounded-panel border border-sand-200 bg-white p-6 text-sm text-sand-600">
            Categories could not be loaded. Confirm the database migrations have been applied.
          </p>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-card" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categories?.map((category) => (
              <motion.div
                key={category.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="group flex h-full flex-col justify-between rounded-card border border-sand-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
                >
                  <div>
                    <h3 className="font-display text-xl font-semibold text-sand-900 group-hover:text-brand-800">
                      {category.name}
                    </h3>
                    {category.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-sand-600">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                    Explore
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="border-t border-sand-200 bg-sand-100/60 py-16 lg:py-24">
        <div className="container-page">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-sand-900 lg:text-4xl">
                Featured products
              </h2>
              <p className="mt-2 text-sand-600">A pick of what moves fastest on site.</p>
            </div>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-800"
            >
              Shop all
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ProductGrid
            products={featured.data}
            isLoading={featured.isLoading}
            isError={featured.isError}
          />
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-page">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-sand-900 lg:text-4xl">
                New arrivals
              </h2>
              <p className="mt-2 text-sand-600">Freshly added to the catalogue.</p>
            </div>
          </div>
          <ProductGrid
            products={newArrivals.data}
            isLoading={newArrivals.isLoading}
            isError={newArrivals.isError}
          />
        </div>
      </section>
    </>
  )
}
