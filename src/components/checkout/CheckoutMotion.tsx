import { m, useReducedMotion } from 'framer-motion'
import { Check, CheckCircle2 } from 'lucide-react'
import { DURATION, EASE, SPRING } from '@/lib/motion'
import { cn } from '@/lib/utils'

/*
  Presentation-only pieces for the checkout page. Nothing here owns state or
  gates an action: each component renders from values the page already has.
*/

type Step = { label: string; done: boolean }

/**
 * Address → Delivery → Payment. Steps tick as the page's existing selections
 * are made; the connecting line fills with scaleX (transform only).
 */
export function CheckoutProgress({ addressDone, shippingDone }: { addressDone: boolean; shippingDone: boolean }) {
  const steps: Step[] = [
    { label: 'Address', done: addressDone },
    { label: 'Delivery', done: shippingDone },
    { label: 'Payment', done: false },
  ]
  const currentIndex = steps.findIndex((step) => !step.done)

  return (
    <ol className="flex items-center" aria-label="Checkout progress">
      {steps.map((step, index) => {
        const current = index === currentIndex
        return (
          <li key={step.label} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
            <span className="flex items-center gap-2" aria-current={current ? 'step' : undefined}>
              <span
                className={cn(
                  'relative flex size-7 shrink-0 items-center justify-center rounded-pill text-xs font-bold transition-colors duration-(--duration-base)',
                  step.done
                    ? 'bg-primary text-on-primary'
                    : current
                      ? 'bg-primary-soft text-primary ring-2 ring-primary'
                      : 'bg-surface-sunken text-content-muted',
                )}
              >
                {step.done ? (
                  <m.span key="done" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={SPRING} className="flex">
                    <Check className="size-4" strokeWidth={3} aria-hidden />
                  </m.span>
                ) : (
                  index + 1
                )}
              </span>
              <span className={cn('text-sm font-bold', step.done || current ? 'text-content' : 'text-content-muted')}>
                {step.label}
                <span className="sr-only">{step.done ? ' (done)' : current ? ' (current)' : ''}</span>
              </span>
            </span>
            {index < steps.length - 1 ? (
              <span aria-hidden className="mx-3 h-0.5 flex-1 overflow-hidden rounded-pill bg-border-subtle">
                <m.span
                  className="block h-full origin-left rounded-pill bg-primary"
                  initial={false}
                  animate={{ scaleX: step.done ? 1 : 0 }}
                  transition={{ duration: DURATION.slow, ease: EASE.expo }}
                />
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Highlight that glides between options in a radio group. Render it inside
 * the selected option only; options sharing a `layoutId` animate between
 * each other.
 */
export function SelectedHighlight({ layoutId }: { layoutId: string }) {
  return (
    <m.span
      aria-hidden
      layoutId={layoutId}
      transition={{ duration: DURATION.base, ease: EASE.expo }}
      className="pointer-events-none absolute inset-0 rounded-card border-2 border-iris-600 bg-iris-50"
    />
  )
}

const CONFETTI_COLOURS = ['bg-iris-400', 'bg-pill-best', 'bg-success-solid', 'bg-star', 'bg-iris-600', 'bg-pill-sale']

/**
 * Success mark for a confirmed order: the tick springs in and a single burst
 * of confetti flies out once. The confirmation text renders immediately
 * alongside it; nothing waits for the animation.
 */
export function SuccessCelebration() {
  const reduce = useReducedMotion()
  const pieces = reduce ? [] : Array.from({ length: 14 }, (_, i) => i)

  return (
    <div className="relative flex size-20 items-center justify-center">
      {!reduce ? (
        <m.span
          aria-hidden
          className="absolute inset-0 rounded-pill bg-success-surface"
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.9, ease: EASE.expo, delay: 0.15 }}
        />
      ) : null}
      {pieces.map((i) => {
        const angle = (i / pieces.length) * Math.PI * 2
        const distance = 70 + (i % 3) * 18
        return (
          <m.span
            key={i}
            aria-hidden
            className={cn('absolute size-2 rounded-[2px]', CONFETTI_COLOURS[i % CONFETTI_COLOURS.length])}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance + 30,
              opacity: 0,
              rotate: (i % 2 ? 1 : -1) * 200,
              scale: 1,
            }}
            transition={{ duration: 1.1, ease: EASE.soft, delay: 0.2 }}
          />
        )
      })}
      <m.span
        initial={reduce ? false : { scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="relative flex"
      >
        <CheckCircle2 className="size-16 text-success" aria-hidden />
      </m.span>
    </div>
  )
}
