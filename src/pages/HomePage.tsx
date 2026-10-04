import { motion } from 'framer-motion'
import { ArrowRight, BadgeIndianRupee, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CategoryTile } from '@/components/catalog/CategoryTile'
import { PromoBanner } from '@/components/marketing/PromoBanner'
import { TrustStrip, type TrustItem } from '@/components/marketing/TrustStrip'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Card } from '@/components/ui/card'
import { IconChip } from '@/components/ui/icon-chip'
import { SectionHeader } from '@/components/ui/section-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories, useFeaturedProducts, useNewArrivals } from '@/features/catalog/queries'
import { useDocumentHead } from '@/hooks/useDocumentHead'

/** Short reassurance chips that sit under the hero CTAs. */
const HERO_CHIPS: TrustItem[] = [
  { icon: Truck, title: 'Quick delivery', detail: 'In 2 days', tone: 'lavender' },
  { icon: ShieldCheck, title: 'Secure payment', detail: 'Razorpay', tone: 'mint' },
  { icon: PackageCheck, title: 'Genuine brands', detail: 'Authorised stock', tone: 'peach' },
]

/** The full trust strip at the foot of the page. */
const TRUST_ITEMS: TrustItem[] = [
  {
    icon: Truck,
    title: 'Quick & standard delivery',
    detail: 'Quick in 2 days, standard in 4–6, across Tamil Nadu.',
    tone: 'lavender',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Razorpay payment',
    detail: 'Cards, UPI and netbanking, or pay cash on delivery.',
    tone: 'mint',
  },
  {
    icon: PackageCheck,
    title: 'Easy returns',
    detail: 'Unopened stock can be returned — talk to us and we sort it.',
    tone: 'sky',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Trade pricing',
    detail: 'Project quantities priced for builders and carpenters.',
    tone: 'peach',
  },
]

const PROJECT_PATHS = [
  { label: 'Kitchen fit-out', detail: 'Baskets, hinges and organisers', slug: 'kitchen-hardware' },
  { label: 'Wardrobe build', detail: 'Rails, runners and handles', slug: 'wardrobe-hardware' },
  { label: 'Cabinet finishing', detail: 'Laminates, pulls and profiles', slug: 'mica-laminates' },
  { label: 'Build essentials', detail: 'Plywood for every application', slug: 'plywood' },
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
      {/* ---------------------------------------------------------------
          Hero — light lavender panel, two-tone headline, image panel with a
          floating discount badge.
          --------------------------------------------------------------- */}
      <section className="container-page pt-6 lg:pt-8">
        <div className="relative overflow-hidden rounded-hero bg-gradient-hero px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-hero text-content">
                Everything for the build.
                <br />
                <span className="text-primary">Delivered fast.</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink-700">
                Plywood, laminates and every fitting in between — thirteen categories of trade-grade
                material, in stock and ready to ship.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="inline-flex h-13 items-center gap-2 rounded-pill bg-primary px-7 text-base font-bold text-on-primary shadow-primary transition-all hover:bg-primary-hover active:translate-y-px"
                >
                  Shop Now
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex h-13 items-center rounded-pill border border-border-strong bg-card px-7 text-base font-bold text-content transition-colors hover:border-primary hover:text-primary"
                >
                  Talk to us
                </Link>
              </div>

              {/* Trust chips */}
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {HERO_CHIPS.map((chip) => (
                  <li
                    key={chip.title}
                    className="flex items-center gap-2.5 rounded-pill bg-card/80 py-2 pr-4 pl-2 shadow-xs backdrop-blur-sm"
                  >
                    <IconChip icon={chip.icon} tone={chip.tone} size="sm" shape="circle" />
                    <span className="leading-tight">
                      <span className="block text-xs font-bold text-content">{chip.title}</span>
                      <span className="block text-[0.6875rem] text-content-muted">{chip.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Image panel with floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-hero shadow-float">
                <img
                  src="/images/categories/kitchen-hardware-960.jpg"
                  srcSet="/images/categories/kitchen-hardware-480.jpg 480w, /images/categories/kitchen-hardware-960.jpg 960w"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  alt="Modern fitted kitchen built with Laghara cabinetry hardware"
                  className="size-full object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 flex size-26 flex-col items-center justify-center rounded-pill bg-pill-best text-center text-on-primary shadow-float">
                <span className="text-[0.6875rem] font-semibold opacity-90">Trade rates</span>
                <span className="text-xl font-extrabold">Up to 30%</span>
                <span className="text-[0.6875rem] font-semibold opacity-90">off list</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="container-page py-10 lg:py-14">
        <SectionHeader
          title="Shop by category"
          subtitle="Thirteen aisles, one tap away."
          actionTo="/shop"
          actionLabel="Explore all"
        />

        {isError ? (
          <Card size="lg" className="text-sm text-content-muted">
            Categories could not be loaded. Confirm the database migrations have been applied.
          </Card>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-card" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {categories?.map((category) => (
              <motion.div
                key={category.id}
                variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <CategoryTile category={category} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="container-page pb-10 lg:pb-14">
        <SectionHeader
          title="Featured Products"
          subtitle="Specified by pros, stocked deep."
          actionTo="/shop"
          actionLabel="View all products"
        />
        <ProductGrid
          products={featured.data}
          isLoading={featured.isLoading}
          isError={featured.isError}
        />
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="container-page pb-10 lg:pb-14">
        <PromoBanner
          badgeLines={['Trade', 'Pricing']}
          title="Project quantities, priced for the trade."
          subtitle="Building a full fit-out? Talk to us for rates on bulk plywood, laminates and hardware."
          ctaLabel="Get a quote"
          ctaTo="/contact"
        />
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="container-page pb-10 lg:pb-14">
        <SectionHeader
          eyebrow="Start with the room"
          title="Plan the whole fit-out"
          actionTo="/shop"
          actionLabel="Browse all"
          actionVariant="pill"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROJECT_PATHS.map((path) => (
            <Link key={path.slug} to={`/category/${path.slug}`} className="group">
              <Card interactive className="h-full">
                <span className="text-h3 block text-content group-hover:text-primary">
                  {path.label}
                </span>
                <span className="mt-1 block text-sm text-content-muted">{path.detail}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
                  Shop collection
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="container-page pb-10 lg:pb-14">
        <SectionHeader title="New arrivals" subtitle="Fresh on the floor this week." />
        <ProductGrid
          products={newArrivals.data}
          isLoading={newArrivals.isLoading}
          isError={newArrivals.isError}
        />
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="container-page pb-14 lg:pb-20">
        <TrustStrip items={TRUST_ITEMS} variant="panel" />
      </section>
    </>
  )
}
