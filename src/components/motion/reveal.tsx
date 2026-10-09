import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { DURATION, EASE, RISE } from '@/lib/motion'

/**
 * Fades a block up the first time it scrolls into view (IntersectionObserver
 * under the hood, triggered once). Renders in place, with no motion, under
 * reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <m.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: RISE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION.reveal, delay, ease: EASE.fluid }}
    >
      {children}
    </m.div>
  )
}
