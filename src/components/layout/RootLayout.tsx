import { m } from 'framer-motion'
import { Suspense, useEffect, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Toaster } from '@/components/ui/toast'
import { PageTransition } from '@/components/motion/page-transition'
import { EASE } from '@/lib/motion'
import { Footer } from './Footer'
import { Header } from './Header'

/**
 * Branded loading state: a fine violet ring with the house monogram, a soft
 * expanding halo, and a breathing wordmark caption. Shown while a lazy route
 * loads.
 */
function BrandedLoader() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex items-center justify-center">
        <m.span
          aria-hidden
          className="absolute size-14 rounded-pill border border-iris-300"
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: EASE.soft }}
        />
        <m.span
          className="size-10 rounded-pill border-[3px] border-border-subtle border-t-iris-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: EASE.fluid }}
        />
        <span
          aria-hidden
          className="absolute font-display text-[0.625rem] font-extrabold tracking-widest text-iris-800"
        >
          LH
        </span>
      </div>
      <m.p
        className="text-[0.6875rem] font-semibold tracking-[0.25em] text-content-muted uppercase"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: 'mirror', ease: EASE.soft }}
      >
        Curating the aisles
      </m.p>
    </div>
  )
}

function RouteFallback() {
  return (
    <div className="container-page flex min-h-dvh items-center justify-center">
      <BrandedLoader />
    </div>
  )
}

export function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthRoute = /^\/(login|signup|forgot-password|reset-password)$/.test(location.pathname)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  useEffect(() => {
    const message = (location.state as { authMessage?: string } | null)?.authMessage
    if (!message) return

    setAuthMessage(message)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location, navigate])

  useEffect(() => {
    if (!authMessage) return

    const timer = window.setTimeout(() => setAuthMessage(null), 6000)
    return () => window.clearTimeout(timer)
  }, [authMessage])

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Keyboard users can jump past the header and category rail. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-pill focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary focus:shadow-float"
      >
        Skip to content
      </a>
      {!isAuthRoute ? <Header /> : null}
      {authMessage && !isAuthRoute ? (
        <div className="container-page pt-4" role="status" aria-live="polite">
          <p className="rounded-md bg-success-surface px-4 py-3 text-sm font-semibold text-success">
            {authMessage}
          </p>
        </div>
      ) : null}
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<RouteFallback />}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </Suspense>
      </main>
      {!isAuthRoute ? <Footer /> : null}
      {!isAuthRoute ? <CartDrawer /> : null}
      <Toaster />
      <ScrollRestoration />
    </div>
  )
}
