import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { DURATION, EASE, RISE, STAGGER } from '@/lib/motion'

/**
 * A grid or list whose children fade up in sequence once it enters the
 * viewport. Change `replayKey` (e.g. when filters change) to play the
 * sequence again for the new set of items.
 */
export function StaggerList<T>({
  items,
  getKey,
  renderItem,
  className,
  itemClassName,
  replayKey,
  stagger = STAGGER.tight,
  maxStaggered = 12,
}: {
  items: T[]
  getKey: (item: T) => string
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  itemClassName?: string
  replayKey?: string
  stagger?: number
  /** Items past this index appear together, so long grids don't trickle in. */
  maxStaggered?: number
}) {
  const reduce = useReducedMotion()

  return (
    <m.div
      key={replayKey}
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      {items.map((item, index) => (
        <m.div
          key={getKey(item)}
          className={itemClassName}
          variants={{
            hidden: { opacity: 0, y: RISE },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: DURATION.slow,
                ease: EASE.fluid,
                delay: Math.min(index, maxStaggered) * stagger,
              },
            },
          }}
        >
          {renderItem(item, index)}
        </m.div>
      ))}
    </m.div>
  )
}
