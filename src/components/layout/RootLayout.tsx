import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Suspense, useEffect, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer } from './Footer'
import { Header } from './Header'

// Shared expo ease — matches the --ease-out-expo token in index.css.
const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Branded loading state: a fine brass ring with the house monogram, a soft
 * expanding halo, and a breathing wordmark caption. Used for the boot veil
 * and every lazy route.
 */
function BrandedLoader() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute size-14 rounded-full border border-brass-300"
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.span
          className="size-10 rounded-full border-[3px] border-sand-200 border-t-brass-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <span
          aria-hidden
          className="absolute font-display text-[0.625rem] font-extrabold tracking-widest text-brand-800"
        >
          LH
        </span>
      </div>
      <motion.p
        className="text-[0.6875rem] font-semibold tracking-[0.25em] text-sand-500 uppercase"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        Curating the aisles
      </motion.p>
    </div>
  )
}

function RouteFallback() {
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center">
      <BrandedLoader />
    </div>
  )
}

export function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthRoute = /^\/(login|signup|forgot-password|reset-password)$/.test(location.pathname)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  // A short brand veil on first paint: hides font/route hydration flicker and
  // sets the premium tone. Capped at 500ms so it never feels like a delay.
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 500)
    return () => window.clearTimeout(timer)
  }, [])

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
    // reducedMotion="user" disables every animation for users with the OS
    // reduced-motion preference set — complementing the CSS kill-switch.
    <MotionConfig reducedMotion="user" transition={{ duration: 0.25, ease: EASE_EXPO }}>
      <AnimatePresence>
        {!booted ? (
          <motion.div
            key="boot-veil"
            className="fixed inset-0 z-100 flex items-center justify-center bg-sand-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
          >
            <BrandedLoader />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-dvh flex-col">
        {!isAuthRoute ? <Header /> : null}
        {authMessage && !isAuthRoute ? (
          <div className="container-page pt-4" role="status" aria-live="polite">
            <p className="rounded-xl bg-add-50 px-4 py-3 text-sm font-semibold text-add-600">
              {authMessage}
            </p>
          </div>
        ) : null}
        <main id="main" className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        </main>
        {!isAuthRoute ? <Footer /> : null}
        {!isAuthRoute ? <CartDrawer /> : null}
        <ScrollRestoration />
      </div>
    </MotionConfig>
  )
}
