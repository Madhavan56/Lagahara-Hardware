import { animate, m, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { DURATION, EASE } from '@/lib/motion'

/**
 * Counts to `value` with the house expo ease whenever the target changes.
 * The number is written straight to the DOM through a motion value, so React
 * does not re-render on every frame. Jumps straight to the value under
 * reduced motion.
 */
export function AnimatedNumber({
  value,
  from,
  duration = DURATION.slow * 2,
  delay = 0,
  format,
  className,
}: {
  value: number
  /** Starting point for the first count. Defaults to `value` (no count on mount). */
  from?: number
  duration?: number
  delay?: number
  format?: (n: number) => string
  className?: string
}) {
  const reduce = useReducedMotion()
  const motionValue = useMotionValue(reduce ? value : (from ?? value))
  const text = useTransform(motionValue, (latest) => {
    const rounded = Math.round(latest)
    return format ? format(rounded) : String(rounded)
  })

  useEffect(() => {
    if (reduce) {
      motionValue.set(value)
      return
    }
    const controls = animate(motionValue, value, { duration, delay, ease: EASE.expo })
    return () => controls.stop()
  }, [value, duration, delay, reduce, motionValue])

  return <m.span className={className}>{text}</m.span>
}
