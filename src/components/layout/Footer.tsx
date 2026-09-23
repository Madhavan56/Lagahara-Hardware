import { Mail, MapPin, Phone } from 'lucide-react'
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
const MAP_EMBED_SRC =
  `https://maps.google.com/maps?q=${encodeURIComponent(SHOWROOM_QUERY)}&z=16&output=embed`
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOWROOM_QUERY)}`

const SHOWROOM = {
  name: 'Dhuraj Interior — Flagship Showroom',
  address: '1243, Murugan Kovil Street, Kalainyar Nagar, Thanjavur – 613 004',
  phoneDisplay: '+91 73737 30340',
  phoneHref: 'tel:+917373730340',
  email: 'dhuraimuthukumar@hotmail.com',
  hours: 'Mon–Sat · 9 AM – 6 PM',
  website: { label: 'www.dhurajinterior.in', href: 'https://www.dhurajinterior.in' },
}

export function Footer() {
  return (
    <footer className="mt-24 bg-brand-950 text-sand-300">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* Brand + description */}
        <div className="lg:pr-4">
          <p className="font-display text-2xl font-extrabold text-sand-50">
            Laghara <span className="text-brass-400">Hardwares</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-sand-400">
            Interior and furniture materials for builders, carpenters and designers. Trade-grade
            stock, honest pricing, delivered on schedule across Tamil Nadu.
          </p>
        </div>

        {/* Client showroom / contact */}
        <div className="sm:col-span-2">
          <p className="mb-4 text-xs font-semibold tracking-widest text-sand-500 uppercase">
            Visit our showroom
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brass-400" aria-hidden />
              <span className="leading-relaxed text-sand-300">{SHOWROOM.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-brass-400" aria-hidden />
              <a
                href={SHOWROOM.phoneHref}
                className="text-sand-300 transition-colors hover:text-brass-300"
              >
                {SHOWROOM.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-brass-400" aria-hidden />
              <a
                href={`mailto:${SHOWROOM.email}`}
                className="break-all text-sand-300 transition-colors hover:text-brass-300"
              >
                {SHOWROOM.email}
              </a>
            </li>
            <li className="text-xs text-sand-500">
              {SHOWROOM.hours} ·{' '}
              <a
                href={SHOWROOM.website.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brass-400 transition-colors hover:text-brass-300"
              >
                {SHOWROOM.website.label}
              </a>
            </li>
          </ul>

          {/* Embedded map */}
          <div className="mt-5 overflow-hidden rounded-xl border border-brand-900">
            <iframe
              title="Dhuraj Interior showroom location — Kalainyar Nagar, Thanjavur"
              src={MAP_EMBED_SRC}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-44 w-full border-0 sm:h-40"
              allowFullScreen
            />
          </div>
          <a
            href={MAP_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brass-400 transition-colors hover:text-brass-300"
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
          <p>© {new Date().getFullYear()} Laghara Hardwares. All rights reserved.</p>
          <p>All prices are inclusive of GST.</p>
        </div>
      </div>
    </footer>
  )
}
