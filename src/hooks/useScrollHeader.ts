import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'

/**
 * True once the page has scrolled past `threshold` px. Reads scroll through a
 * motion value and only sets state when the boolean flips, so the header
 * re-renders twice per scroll direction change rather than on every frame.
 */
export function useScrollHeader(threshold = 8) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > threshold)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const next = latest > threshold
    setScrolled((previous) => (previous === next ? previous : next))
  })

  return scrolled
}
