import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'

const SPRING = { stiffness: 180, damping: 18, mass: 0.6 }

/**
 * Tilts its content toward the pointer in 3D, settling back on leave.
 * Pointer-only (touch never triggers it) and inert under reduced motion.
 * Transform only, so it composites on the GPU.
 */
export function Tilt({
  children,
  className,
  maxDeg = 6,
}: {
  children: ReactNode
  className?: string
  /** Largest rotation, in degrees, at the panel's edges. */
  maxDeg?: number
}) {
  const reduce = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-maxDeg, maxDeg]), SPRING)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [maxDeg, -maxDeg]), SPRING)

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  function reset() {
    px.set(0)
    py.set(0)
  }

  return (
    <div className={className} style={{ perspective: 1200 }} onPointerMove={onPointerMove} onPointerLeave={reset}>
      <m.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="h-full w-full will-change-transform">
        {children}
      </m.div>
    </div>
  )
}
