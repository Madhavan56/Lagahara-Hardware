import { motion } from 'framer-motion'
import { ArrowRight, Clock3, ShieldCheck, Truck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories, useFeaturedProducts, useNewArrivals } from '@/features/catalog/queries'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { getCategoryVisual } from '@/lib/categoryVisuals'

const TRUST_POINTS = [
  { icon: Zap, label: 'Quick delivery in 2 days' },
  { icon: ShieldCheck, label: 'Genuine, authorised brands' },
  { icon: Truck, label: 'Trade to project quantities' },
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
      <section className="relative overflow-hidden bg-gradient-to-br from-brass-500 via-brass-600 to-brand-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgb(255 255 255 / 0.5), transparent 40%), radial-gradient(circle at 85% 85%, rgb(11 59 52 / 0.6), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="container-page relative py-14 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              <Clock3 className="size-3.5" />
              Quick delivery in 2 days · Standard in 4–6
            </div>
            <h1 className="max-w-xl text-4xl leading-[1.05] font-extrabold text-white sm:text-5xl lg:text-6xl">
              Everything for the build, delivered fast.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/90 lg:text-lg">
              Plywood, laminates and every fitting in between — thirteen categories of trade-grade
              material, in stock and ready to ship.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex h-13 items-center gap-2 rounded-2xl bg-sand-950 px-7 text-base font-bold text-white shadow-float transition-transform active:scale-95"
              >
                Shop all products
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-13 items-center rounded-2xl border-2 border-white/40 px-7 text-base font-bold text-white transition-colors hover:bg-white/10"
              >
                Talk to us
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_POINTS.map((point) => (
                <div key={point.label} className="flex items-center gap-1.5 text-sm font-medium text-white/90">
                  <point.icon className="size-4" />
                  {point.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-10 lg:py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-extrabold text-sand-900 lg:text-2xl">Shop by category</h2>
          <Link to="/shop" className="text-sm font-bold text-brass-600 hover:text-brass-700">
            View all
          </Link>
        </div>

        {isError ? (
          <p className="rounded-panel border border-sand-200 bg-white p-6 text-sm text-sand-600">
            Categories could not be loaded. Confirm the database migrations have been applied.
          </p>
        ) : isLoading ? (
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-7">
            {Array.from({ length: 13 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-3xl" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
            className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-7"
          >
            {categories?.map((category) => {
              const visual = getCategoryVisual(category.slug)
              return (
                <motion.div
                  key={category.id}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link to={`/category/${category.slug}`} className="group flex flex-col items-center gap-2 text-center">
                    <span
                      className={`flex aspect-square w-full items-center justify-center rounded-3xl ${visual.bg} transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-lift`}
                    >
                      <visual.icon className={`size-7 sm:size-8 ${visual.fg}`} />
                    </span>
                    <span className="line-clamp-2 text-xs leading-tight font-semibold text-sand-800 sm:text-sm">
                      {category.name}
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </section>

      <section className="border-t border-sand-200 bg-white py-10 lg:py-14">
        <div className="container-page">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-extrabold text-sand-900 lg:text-2xl">Featured</h2>
            <Link to="/shop" className="text-sm font-bold text-brass-600 hover:text-brass-700">
              Shop all
            </Link>
          </div>
          <ProductGrid products={featured.data} isLoading={featured.isLoading} isError={featured.isError} />
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="container-page">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-extrabold text-sand-900 lg:text-2xl">New arrivals</h2>
          </div>
          <ProductGrid products={newArrivals.data} isLoading={newArrivals.isLoading} isError={newArrivals.isError} />
        </div>
      </section>
    </>
  )
}
