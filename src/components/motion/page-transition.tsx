import { m } from 'framer-motion'
import type { ReactNode } from 'react'
import { DURATION, EASE, RISE } from '@/lib/motion'

/**
 * Enter-only route transition: the new page fades and rises in. There is no
 * exit animation, so navigation is never held back waiting for the old page.
 * Key it on the pathname so each route plays it once.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: RISE / 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE.expo }}
    >
      {children}
    </m.div>
  )
}
