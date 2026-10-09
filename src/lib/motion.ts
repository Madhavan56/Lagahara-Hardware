import type { Transition, Variants } from 'framer-motion'

/*
  Motion tokens. The single source for every JS-driven animation. The same
  values are mirrored as CSS variables (`--duration-*`, `--stagger-*`) in
  index.css for CSS-only transitions; change both together.

  Rules of use:
    - Animate transform and opacity only.
    - Never gate a user action on an animation finishing.
    - Reduced motion is handled globally by <MotionConfig reducedMotion="user">
      in providers.tsx plus the CSS kill-switch; components with their own
      timers or loops also check `useReducedMotion()`.
*/

/** Seconds. */
export const DURATION = {
  instant: 0.1,
  fast: 0.18,
  base: 0.28,
  slow: 0.5,
  /** Scroll entries: slow and heavy, per the high-end-visual-design skill. */
  reveal: 0.85,
} as const

/** Seconds between siblings in a staggered group. */
export const STAGGER = {
  tight: 0.04,
  base: 0.07,
} as const

/** Matches --ease-out-expo / --ease-out-soft / --ease-fluid in index.css. */
export const EASE = {
  expo: [0.16, 1, 0.3, 1],
  soft: [0.33, 1, 0.68, 1],
  /** Weighted settle for large surfaces: menus, overlays, scroll reveals. */
  fluid: [0.32, 0.72, 0, 1],
} as const satisfies Record<string, [number, number, number, number]>

/** For small pops: badges, hearts, check marks. */
export const SPRING: Transition = { type: 'spring', stiffness: 500, damping: 24 }

/** Default transition for anything that doesn't specify its own. */
export const BASE_TRANSITION: Transition = { duration: DURATION.base, ease: EASE.expo }

/** Distance (px) content travels while fading up. Kept small so nothing feels like it jumps. */
export const RISE = 24

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: RISE },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE.fluid } },
}

export const staggerParent = (stagger: number = STAGGER.base, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
})
