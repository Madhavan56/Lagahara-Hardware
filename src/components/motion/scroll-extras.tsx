import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useState } from 'react'

/** Thin brand-gradient bar along the top edge that fills as the page scrolls. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduce = useReducedMotion()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 })
  return (
    <m.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-brand"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
    />
  )
}

/** Round button that springs in once the visitor is a screen or more down the page. */
export function BackToTop() {
  const { scrollY } = useScroll()
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > window.innerHeight * 1.2
    if (next !== visible) setVisible(next)
  })

  return (
    <AnimatePresence>
      {visible ? (
        <m.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex size-11 items-center justify-center rounded-pill bg-card text-primary shadow-float ring-1 ring-ink-950/[0.06] max-lg:bottom-24 sm:right-6"
          aria-label="Back to top"
        >
          <ArrowUp className="size-5" />
        </m.button>
      ) : null}
    </AnimatePresence>
  )
}
