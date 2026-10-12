import { m, useReducedMotion } from 'framer-motion'
import { DURATION, EASE, STAGGER } from '@/lib/motion'

/**
 * Page <h1> whose words rise out of a clipping mask one after another, then a
 * short gradient accent grows underneath. Keyed on the text, so it replays
 * when the title changes (e.g. moving between categories). Screen readers get
 * the plain sentence via aria-label.
 */
export function PageTitle({
  text,
  className,
  accent = true,
}: {
  text: string
  className?: string
  /** Gradient bar under the title. Off for centred empty states. */
  accent?: boolean
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')

  return (
    <h1 key={text} aria-label={text} className={className}>
      <span aria-hidden className="block">
        {words.map((word, i) => (
          // Bottom padding stops descenders (g, y, p) being clipped by the mask.
          <span key={`${word}-${i}`} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
            <m.span
              className="inline-block"
              initial={reduce ? false : { y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: DURATION.slow + 0.15, delay: i * STAGGER.base, ease: EASE.expo }}
            >
              {word}
              {i < words.length - 1 ? ' ' : null}
            </m.span>
          </span>
        ))}
      </span>
      {accent ? (
        <m.span
          aria-hidden
          className="mt-3 block h-1 w-14 origin-left rounded-pill bg-gradient-brand"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DURATION.reveal, delay: words.length * STAGGER.base + 0.1, ease: EASE.expo }}
        />
      ) : null}
    </h1>
  )
}
