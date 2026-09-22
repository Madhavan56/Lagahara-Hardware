import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

function RouteFallback() {
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-sand-300 border-t-brand-700" />
    </div>
  )
}

export function RootLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
