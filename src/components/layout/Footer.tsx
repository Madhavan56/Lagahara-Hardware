import { Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const ACCOUNT_LINKS = [
  { to: '/account', label: 'My account' },
  { to: '/account/orders', label: 'Order history' },
  { to: '/track', label: 'Track order' },
  { to: '/wishlist', label: 'Wishlist' },
]

// Embedded client showroom map (Dhuraj Interior, Thanjavur) — no API key
// needed. Uses the maps.google.com embed endpoint: the www.google.com keyless
// variant refuses to render on production domains ("This content is blocked"),
// while this endpoint is iframe-safe everywhere. Loading is lazy so the footer
// never blocks page paint.
const SHOWROOM_QUERY = '1243, Murugan Kovil Street, Kalainyar Nagar, Thanjavur 613004'
const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(SHOWROOM_QUERY)}&z=16&output=embed`
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOWROOM_QUERY)}`

const SHOWROOM = {
  name: 'Dhuraj Interior, Flagship Showroom',
  address: '1243, Murugan Kovil Street, Kalainyar Nagar, Thanjavur 613 004',
  phoneDisplay: '+91 73737 30340',
  phoneHref: 'tel:+917373730340',
  email: 'dhuraimuthukumar@hotmail.com',
  hours: 'Mon to Sat, 9 AM to 6 PM',
  website: { label: 'www.dhurajinterior.in', href: 'https://www.dhurajinterior.in' },
}

/**
 * Mounts the Google Maps iframe only when the footer is about to scroll into
 * view. `loading="lazy"` alone still fetched ~270 KB of Maps scripts on short
 * pages and while content was loading. The placeholder keeps the same height,
 * so nothing shifts when the map appears.
 */
function ShowroomMap() {
  const ref = useRef<HTMLDivElement>(null)
  // Browsers without IntersectionObserver just show the map straight away.
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref.current
    if (!node || near) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true)
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [near])

  return (
    <div ref={ref} className="mt-5 h-44 overflow-hidden rounded-card bg-white/5 ring-1 ring-white/10 sm:h-40">
      {near ? (
        <iframe
          title="Dhuraj Interior showroom location, Kalainyar Nagar, Thanjavur"
          src={MAP_EMBED_SRC}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-full border-0"
          allowFullScreen
        />
      ) : null}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="focus-ring-light mt-24 bg-iris-950 text-iris-200">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* Brand + description */}
        <div className="lg:pr-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-mark.svg"
              alt="Laghara Hardwares logo icon"
              className="h-12 w-12 rounded-md object-cover ring-1 ring-white/10"
            />
            <p className="font-display text-2xl font-extrabold text-white">
              Laghara <span className="text-iris-300">Hardwares</span>
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-iris-200/70">
            Interior and furniture materials for builders, carpenters and designers. Trade-grade
            stock, honest pricing, delivered on schedule across Tamil Nadu.
          </p>
        </div>

        {/* Client showroom / contact */}
        <div className="sm:col-span-2">
          <p className="mb-4 text-sm font-bold text-white">Visit our showroom</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-iris-300" aria-hidden />
              <span className="leading-relaxed">{SHOWROOM.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-iris-300" aria-hidden />
              <a href={SHOWROOM.phoneHref} className="transition-colors hover:text-white">
                {SHOWROOM.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-iris-300" aria-hidden />
              <a
                href={`mailto:${SHOWROOM.email}`}
                className="break-all transition-colors hover:text-white"
              >
                {SHOWROOM.email}
              </a>
            </li>
            <li className="text-xs text-iris-200/60">
              {SHOWROOM.hours} ·{' '}
              <a
                href={SHOWROOM.website.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-iris-300 underline underline-offset-2 transition-colors hover:text-white"
              >
                {SHOWROOM.website.label}
              </a>
            </li>
          </ul>

          <ShowroomMap />
          <a
            href={MAP_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-iris-300 transition-colors hover:text-white"
          >
            Get directions on Google Maps
            <svg viewBox="0 0 16 16" fill="none" className="size-3" aria-hidden>
              <path
                d="M4 12 12 4M6 4h6v6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Account links */}
        <div>
          <p className="mb-4 text-sm font-bold text-white">Account</p>
          <ul className="space-y-2 text-sm">
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-iris-200/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Laghara Hardwares. All rights reserved.</p>
          <p>All prices are inclusive of GST.</p>
        </div>
      </div>
    </footer>
  )
}
