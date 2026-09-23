import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Counts up to `value` with the house expo ease whenever the target changes.
 * Respects the OS reduced-motion preference by jumping straight to the value.
 */
export function AnimatedNumber({
  value,
  duration = 0.9,
  format,
}: {
  value: number
  duration?: number
  format?: (n: number) => string
}) {
  const reduceMotion = useReducedMotion()
  const motionValue = useMotionValue(value)
  const [display, setDisplay] = useState(() => (format ? format(value) : String(value)))

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value)
      return
    }
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [value, duration, reduceMotion, motionValue])

  useMotionValueEvent(motionValue, 'change', (latest) => {
    const rounded = Math.round(latest)
    setDisplay(format ? format(rounded) : String(rounded))
  })

  return <span>{display}</span>
}
