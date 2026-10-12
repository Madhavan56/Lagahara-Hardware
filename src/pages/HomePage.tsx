import { m, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { BadgeIndianRupee, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { CategoryTile } from '@/components/catalog/CategoryTile'
import { PromoBanner } from '@/components/marketing/PromoBanner'
import { TrustStrip, type TrustItem } from '@/components/marketing/TrustStrip'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Bezel } from '@/components/ui/bezel'
import { Card } from '@/components/ui/card'
import { IslandIcon } from '@/components/ui/island-icon'
import { Reveal } from '@/components/motion/reveal'
import { Tilt } from '@/components/motion/tilt'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { SectionHeader } from '@/components/ui/section-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories, useFeaturedProducts, useNewArrivals } from '@/features/catalog/queries'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { DURATION, EASE as MOTION_EASE, RISE, STAGGER } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/catalog'

const EASE = MOTION_EASE.expo

/** The full trust strip at the foot of the page. */
const TRUST_ITEMS: TrustItem[] = [
  {
    icon: Truck,
    title: 'Quick & standard delivery',
    detail: 'Quick in 2 days, standard in 4 to 6 days, across Tamil Nadu.',
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
    detail: 'Unopened stock can be returned. Talk to us and we sort it out.',
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

/** Answers are limited to what the store already states elsewhere on the site. */
const FAQS = [
  {
    q: 'Are your prices inclusive of GST?',
    a: 'Yes. Every price on the site includes GST, and each order comes with a GST invoice.',
  },
  {
    q: 'How do I track my order?',
    a: 'Sign in and open Track order with your order number, or find it under Order history in your account.',
  },
  {
    q: 'Can I see the materials before I buy?',
    a: 'Yes. Visit the showroom at 1243, Murugan Kovil Street, Kalainyar Nagar, Thanjavur, Monday to Saturday, 9 AM to 6 PM.',
  },
  {
    q: 'How do bulk or trade orders work?',
    a: 'Tell us what the project needs and we quote trade rates on plywood, laminates and hardware in project quantities.',
  },
]

export default function HomePage() {
  const { data: categories, isLoading, isError } = useCategories()
  const featured = useFeaturedProducts(8)
  const newArrivals = useNewArrivals(8)

  useDocumentHead({
    title: 'Laghara Hardwares | Interior & Furniture Materials',
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
      <Hero />
      <div className="container-page">
        <CategoryTicker categories={categories} />
      </div>

      {/* --------------------------------------------------------------- */}
      <section className="container-page py-16 lg:py-28">
        <SectionHeader title="Shop by category" subtitle="Thirteen aisles, one tap away." actionTo="/shop" actionLabel="Shop all" />

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
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(11rem,auto)] lg:grid-cols-4"
          >
            {categories?.map((category, index) => (
              <m.div
                key={category.id}
                // Asymmetrical bento: the first aisle is the feature cell; collapses to one column on phones.
                className={index === 0 ? 'lg:col-span-2 lg:row-span-2' : undefined}
                variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <CategoryTile category={category} featured={index === 0} />
              </m.div>
            ))}
          </m.div>
        )}
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="container-page pb-16 lg:pb-28">
        <SectionHeader title="Featured products" subtitle="Specified by pros, stocked deep." actionTo="/shop" actionLabel="Shop all" />
        <ProductGrid products={featured.data} isLoading={featured.isLoading} isError={featured.isError} />
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="container-page pb-16 lg:pb-28">
        <Reveal>
          <PromoBanner
            badgeLines={['Trade', 'Pricing']}
            title="Project quantities, priced for the trade."
            subtitle="Building a full fit-out? Talk to us for rates on bulk plywood, laminates and hardware."
            ctaLabel="Get a quote"
            ctaTo="/contact"
          />
        </Reveal>
      </section>

      <ProjectPaths />

      {/* --------------------------------------------------------------- */}
      <section className="container-page pb-16 lg:pb-28">
        <SectionHeader title="New arrivals" subtitle="Fresh on the floor this week." />
        <ProductGrid products={newArrivals.data} isLoading={newArrivals.isLoading} isError={newArrivals.isError} />
      </section>

      <Faq />

      {/* --------------------------------------------------------------- */}
      <section className="container-page pb-20 lg:pb-32">
        <Reveal>
          <TrustStrip items={TRUST_ITEMS} variant="panel" />
        </Reveal>
      </section>
    </>
  )
}

/* ------------------------------------------------------------------ Hero */

const HEADLINE_LEAD = 'Everything for the build.'.split(' ')
const HEADLINE_PROMISE = 'Delivered fast.'.split(' ')

function Hero() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  // Scroll parallax: as the hero leaves the viewport the copy and the photo
  // drift apart a little, which gives the panel depth. Transform only.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40])
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 70])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.06])

  // Word-by-word headline, then subtext, then CTAs. Everything is clickable
  // from the first frame; the motion only affects opacity and transform.
  const word: Variants = {
    hidden: reduce ? {} : { opacity: 0, y: '0.5em', rotateX: -40 },
    show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: DURATION.slow + 0.1, ease: EASE } },
  }
  const words = HEADLINE_LEAD.length + HEADLINE_PROMISE.length
  const wordsDone = words * STAGGER.base
  // Subtext and CTAs rise in alongside the headline. Transform only, no fade:
  // the subtext is the page's Largest Contentful Paint element on phones, so it
  // must be visible from the first frame rather than waiting on the animation.
  const after = (step: number): Variants => ({
    hidden: reduce ? {} : { y: RISE },
    show: { y: 0, transition: { duration: DURATION.reveal, ease: EASE, delay: (step + 1) * STAGGER.base } },
  })

  return (
    <section ref={sectionRef} className="container-page pt-6 lg:pt-8">
      <Bezel coreClassName="relative overflow-hidden bg-gradient-hero px-6 py-12 sm:px-10 lg:px-16 lg:py-20">
        {/* Drifting light blooms. Radial gradients (no blur filter) keep painting cheap. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-1/3 -left-1/4 size-[36rem] animate-drift rounded-full bg-[radial-gradient(circle,rgb(149_123_238/0.28),transparent_65%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1/4 -bottom-1/2 size-[40rem] animate-drift-slow rounded-full bg-[radial-gradient(circle,rgb(236_95_158/0.16),transparent_65%)]"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <m.div initial="hidden" animate="show" style={{ y: copyY }}>
            <m.p
              variants={after(-1)}
              className="mb-5 inline-flex items-center gap-2 rounded-pill bg-card/70 px-3 py-1 text-[0.625rem] font-semibold tracking-[0.2em] text-primary uppercase ring-1 ring-primary/15"
            >
              <span className="relative flex size-1.5">
                {!reduce ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" /> : null}
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Trade-grade interior materials
            </m.p>
            <m.h1
              className="text-hero text-content [perspective:800px]"
              variants={{ hidden: {}, show: { transition: { staggerChildren: STAGGER.base } } }}
            >
              <span className="block">
                {HEADLINE_LEAD.map((w) => (
                  <m.span key={w} variants={word} className="mr-[0.25em] inline-block origin-bottom">
                    {w}
                  </m.span>
                ))}
              </span>
              <span className="relative inline-block pb-1">
                {HEADLINE_PROMISE.map((w, i) => (
                  <m.span
                    key={w}
                    variants={word}
                    className={cn(
                      'inline-block origin-bottom bg-gradient-brand bg-clip-text text-transparent',
                      i < HEADLINE_PROMISE.length - 1 && 'mr-[0.25em]',
                    )}
                  >
                    {w}
                  </m.span>
                ))}
                {/* A single violet stroke draws under the promise once the words land. */}
                <m.span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-0.5 h-1.5 origin-left rounded-pill bg-iris-300"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: DURATION.reveal, delay: wordsDone + 0.15, ease: EASE }}
                />
              </span>
            </m.h1>
            <m.p variants={after(0)} className="mt-5 max-w-md text-base leading-relaxed text-ink-700">
              Plywood, laminates and every fitting in between. Thirteen categories of trade-grade material, in stock and ready
              to ship.
            </m.p>

            <m.div variants={after(1)} className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group sheen-sweep inline-flex h-13 items-center gap-3 rounded-pill bg-primary pr-2 pl-7 text-base font-bold text-on-primary shadow-primary transition-[background-color,transform,box-shadow] duration-(--duration-base) ease-[var(--ease-fluid)] hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lift active:scale-[0.98]"
              >
                Shop all
                <IslandIcon className="size-9" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-13 items-center rounded-pill bg-card/80 px-7 text-base font-bold text-content ring-1 ring-ink-950/[0.08] transition-[color,box-shadow,transform] duration-(--duration-base) ease-[var(--ease-fluid)] hover:-translate-y-0.5 hover:text-primary hover:ring-primary/40 active:scale-[0.98]"
              >
                Get a quote
              </Link>
            </m.div>
          </m.div>

          {/* Image panel: tilts toward the pointer, drifts on scroll, with two floating badges. */}
          <m.div
            initial={reduce ? false : { opacity: 0, scale: 0.94, rotate: -1.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: DURATION.reveal + 0.15, delay: 0.15, ease: EASE }}
            style={{ y: imageY }}
            className="relative hidden lg:block"
          >
            <Tilt maxDeg={5}>
              <Bezel coreClassName="relative aspect-[4/3] overflow-hidden">
                <m.img
                  src="/images/categories/kitchen-hardware-960.jpg"
                  srcSet="/images/categories/kitchen-hardware-480.jpg 480w, /images/categories/kitchen-hardware-960.jpg 960w"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  alt="Modern fitted kitchen built with Laghara cabinetry hardware"
                  className="size-full object-cover"
                  style={{ scale: imageScale }}
                  fetchPriority="high"
                  decoding="async"
                />
              </Bezel>
            </Tilt>

            {/* Pops in, then floats gently (CSS bob on an inner wrapper so the two transforms don't fight). */}
            <m.div
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.6 }}
              className="absolute -bottom-4 -left-4"
            >
              <div className="flex size-26 animate-bob flex-col items-center justify-center rounded-pill bg-pill-best text-center text-on-primary shadow-float">
                <span className="text-[0.6875rem] font-semibold opacity-90">Trade rates</span>
                <span className="text-xl font-extrabold tabular-nums">
                  Up to <AnimatedNumber value={30} from={0} delay={0.7} />%
                </span>
                <span className="text-[0.6875rem] font-semibold opacity-90">off list</span>
              </div>
            </m.div>

            <m.div
              initial={reduce ? false : { x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.85 }}
              className="absolute -top-5 -right-4"
            >
              <div className="flex animate-bob items-center gap-2.5 rounded-pill bg-card/90 py-2 pr-4 pl-2 shadow-float ring-1 ring-ink-950/[0.06] [animation-delay:-1.6s]">
                <span className="flex size-8 items-center justify-center rounded-pill bg-primary-soft text-primary">
                  <Truck className="size-4" aria-hidden />
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-bold text-content">Quick delivery</span>
                  <span className="block text-[0.6875rem] text-content-muted">In 2 days</span>
                </span>
              </div>
            </m.div>
          </m.div>
        </div>
      </Bezel>
    </section>
  )
}

/* ------------------------------------------------------- Category ticker */

/** Endless strip of aisle names; pauses on hover/focus so a link can be picked. */
function CategoryTicker({ categories }: { categories: Category[] | undefined }) {
  if (!categories?.length) return <div className="h-14" />
  const loop = [...categories, ...categories]
  return (
    <div
      className="group relative mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
      aria-label="Browse categories"
    >
      <ul className="flex w-max animate-marquee gap-3 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]">
        {loop.map((category, i) => (
          <li key={`${category.id}-${i}`} aria-hidden={i >= categories.length ? true : undefined}>
            <Link
              to={`/category/${category.slug}`}
              tabIndex={i >= categories.length ? -1 : undefined}
              className="inline-flex items-center gap-2 rounded-pill bg-card px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink-700 ring-1 ring-ink-950/[0.06] transition-colors hover:bg-primary-soft hover:text-primary"
            >
              <span className="size-1.5 rounded-full bg-iris-300" aria-hidden />
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* --------------------------------------------------------- Project paths */

function ProjectPaths() {
  return (
    <section className="container-page pb-16 lg:pb-28">
      <SectionHeader eyebrow="Start with the room" title="Plan the whole fit-out" />
      <Reveal>
        <ul className="border-t-2 border-content">
          {PROJECT_PATHS.map((path) => (
            <li key={path.slug} className="border-b border-border-subtle">
              <Link
                to={`/category/${path.slug}`}
                className="group grid items-baseline gap-1 py-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_auto] sm:gap-8"
              >
                <span className="text-h2 text-content transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5 group-hover:text-primary">
                  {path.label}
                </span>
                <span className="text-sm text-content-muted sm:text-base">{path.detail}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary sm:mt-0">
                  Shop collection
                  <IslandIcon tone="dark" className="text-primary" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------- FAQ */

function Faq() {
  return (
    <section className="container-page pb-16 lg:pb-28">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
        <Reveal>
          <h2 className="text-h1 text-content">Questions before you order</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-content-muted">
            Need a price for a whole project, or have another question? We usually reply within a business day.
          </p>
          <Link
            to="/contact"
            className="group mt-6 inline-flex h-11 items-center gap-3 rounded-pill bg-card pr-1.5 pl-5 text-sm font-bold text-primary ring-1 ring-ink-950/[0.08] transition-[box-shadow,transform] duration-(--duration-base) ease-[var(--ease-fluid)] hover:ring-primary/40 active:scale-[0.98]"
          >
            Get a quote
            <IslandIcon tone="dark" />
          </Link>
        </Reveal>

        {/* Side-by-side list rather than an accordion: four short answers read
            faster when they're all visible at once. */}
        <Reveal delay={0.06}>
          <dl className="grid gap-x-10 gap-y-8 border-t-2 border-content pt-8 sm:grid-cols-2">
            {FAQS.map((item) => (
              <div key={item.q}>
                <dt className="text-base font-bold text-content">{item.q}</dt>
                <dd className="mt-2 max-w-[48ch] text-sm leading-relaxed text-content-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
