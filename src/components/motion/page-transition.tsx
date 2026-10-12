import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { DURATION, EASE, RISE } from '@/lib/motion'

/**
 * Enter-only route transition: the new page fades and rises in. There is no
 * exit animation, so navigation is never held back waiting for the old page.
 * Key it on the pathname so each route plays it once.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <m.div
      initial={reduce ? false : { opacity: 0, y: RISE, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: DURATION.slow, ease: EASE.fluid }}
    >
      {children}
    </m.div>
  )
}
