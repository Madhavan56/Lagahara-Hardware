import { Award, Layers, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { useDocumentHead } from '@/hooks/useDocumentHead'

const VALUES = [
  {
    icon: Layers,
    title: '13 categories, one supplier',
    body: 'Plywood through to furniture accessories — stop juggling five vendors for one project.',
  },
  {
    icon: ShieldCheck,
    title: 'Genuine stock, always',
    body: 'Every brand we carry is sourced direct from authorised distributors. No grey-market substitutes.',
  },
  {
    icon: Truck,
    title: 'Delivery that keeps sites moving',
    body: 'Standard in 4–6 days, or Quick in 2 — pick what your timeline actually needs.',
  },
  {
    icon: Award,
    title: 'Trade pricing, transparently',
    body: 'Bulk and project quantities are priced fairly, not negotiated in the dark.',
  },
]

export default function AboutPage() {
  useDocumentHead({
    title: 'About — Laghara Hardwares',
    description: 'Laghara Hardwares supplies interior and furniture materials to builders, carpenters and designers.',
  })

  return (
    <div>
      <section className="bg-gradient-to-br from-brass-500 to-brand-800 py-16 text-white lg:py-24">
        <div className="container-page">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/80">Our story</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold lg:text-5xl">
            Built for the people who build.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/90">
            Laghara Hardwares started with a simple frustration: sourcing the material for one
            interior job meant calling five different suppliers. We put plywood, laminates and
            every fitting in between under one roof — and one delivery.
          </p>
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-card border border-sand-200 bg-white p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-brass-100 text-brass-600">
                <value.icon className="size-5" />
              </span>
              <p className="mt-4 font-bold text-sand-900">{value.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-600">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-sand-200 bg-white py-14 lg:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-sand-900">Who we serve</h2>
            <p className="mt-4 leading-relaxed text-sand-600">
              Carpenters buying a single sheet of plywood for a repair job. Interior designers
              specifying handles and profiles for a full apartment fit-out. Builders stocking a
              site for the next three months. Whatever the scale, the same catalogue, the same
              pricing, the same two delivery speeds.
            </p>
            <Link to="/shop" className={`mt-6 inline-flex ${buttonVariants({ variant: 'primary' })}`}>
              Browse the catalogue
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-card bg-sand-100 p-6">
              <p className="text-3xl font-extrabold text-brass-600">13</p>
              <p className="mt-1 text-xs font-semibold text-sand-600 uppercase">Categories</p>
            </div>
            <div className="rounded-card bg-sand-100 p-6">
              <p className="text-3xl font-extrabold text-brass-600">2 days</p>
              <p className="mt-1 text-xs font-semibold text-sand-600 uppercase">Quick delivery</p>
            </div>
            <div className="rounded-card bg-sand-100 p-6">
              <p className="text-3xl font-extrabold text-brass-600">100%</p>
              <p className="mt-1 text-xs font-semibold text-sand-600 uppercase">Genuine stock</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
