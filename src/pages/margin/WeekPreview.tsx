import { AnimatePresence, animate, m, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type WeekState = 'before' | 'after'

/** A sample event. Times are hours after 9:00 (0..8); `before`/`after` are start times. */
type CalendarEvent = {
  day: number
  name: string
  before: number
  after: number
  length: number
  external?: boolean
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const
const HOURS_SHOWN = 8
const EASE = [0.16, 1, 0.3, 1] as const

const EVENTS: CalendarEvent[] = [
  { day: 0, name: 'Standup', before: 0.5, after: 0.5, length: 0.25 },
  { day: 0, name: '1:1 Priya', before: 2, after: 0.75, length: 0.5 },
  { day: 0, name: 'Design crit', before: 5, after: 1.25, length: 1 },
  { day: 1, name: 'Standup', before: 0.5, after: 0.5, length: 0.25 },
  { day: 1, name: 'Hiring sync', before: 2.5, after: 0.75, length: 0.5 },
  { day: 1, name: 'Lumen call', before: 6, after: 6, length: 1, external: true },
  { day: 2, name: 'Standup', before: 0.5, after: 0.5, length: 0.25 },
  { day: 2, name: 'Roadmap', before: 1.5, after: 4, length: 1 },
  { day: 2, name: 'Pairing', before: 3.5, after: 5, length: 1 },
  { day: 2, name: 'Retro', before: 6.5, after: 6, length: 0.75 },
  { day: 3, name: 'Standup', before: 0.5, after: 0.5, length: 0.25 },
  { day: 3, name: 'Vendor demo', before: 2, after: 2, length: 1, external: true },
  { day: 3, name: 'Sprint plan', before: 4.5, after: 1, length: 1 },
  { day: 3, name: '1:1 Dana', before: 6.5, after: 4, length: 0.5 },
  { day: 4, name: 'Standup', before: 0.5, after: 0.5, length: 0.25 },
  { day: 4, name: 'All hands', before: 3, after: 3, length: 1, external: true },
  { day: 4, name: 'Demo prep', before: 5.5, after: 0.75, length: 0.75 },
]

const MIN_FOCUS_BLOCK = 2

/** Free stretches of at least MIN_FOCUS_BLOCK hours, per day, for the given layout. */
function focusBlocks(state: WeekState) {
  return DAYS.map((_, day) => {
    const busy = EVENTS.filter((e) => e.day === day)
      .map((e) => [e[state], e[state] + e.length] as const)
      .sort((a, b) => a[0] - b[0])
    const blocks: { start: number; length: number }[] = []
    let cursor = 0
    for (const [start, end] of busy) {
      if (start - cursor >= MIN_FOCUS_BLOCK) blocks.push({ start: cursor, length: start - cursor })
      cursor = Math.max(cursor, end)
    }
    if (HOURS_SHOWN - cursor >= MIN_FOCUS_BLOCK) blocks.push({ start: cursor, length: HOURS_SHOWN - cursor })
    return blocks
  })
}

const BLOCKS = { before: focusBlocks('before'), after: focusBlocks('after') }
const TOTALS = {
  before: BLOCKS.before.flat().reduce((sum, b) => sum + b.length, 0),
  after: BLOCKS.after.flat().reduce((sum, b) => sum + b.length, 0),
}

function formatHours(hours: number) {
  const minutes = Math.round(hours * 60)
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}

const pct = (hours: number) => `${(hours / HOURS_SHOWN) * 100}%`

export function WeekPreview() {
  const reduce = useReducedMotion()
  const [state, setState] = useState<WeekState>('before')
  const touched = useRef(false)

  const total = useMotionValue(TOTALS.before)
  const totalLabel = useTransform(total, formatHours)

  // The page's one orchestrated moment: the week reorganises itself shortly after load.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!touched.current) setState('after')
    }, reduce ? 0 : 1200)
    return () => window.clearTimeout(timer)
  }, [reduce])

  useEffect(() => {
    const controls = animate(total, TOTALS[state], { duration: reduce ? 0 : 1, ease: EASE })
    return () => controls.stop()
  }, [state, reduce, total])

  function choose(next: WeekState) {
    touched.current = true
    setState(next)
  }

  return (
    <section
      aria-label="Sample week, before and after Margin"
      className="min-w-0 overflow-hidden rounded-(--m-box) border border-(--m-line) bg-(--m-surface) shadow-[0_30px_60px_-36px_var(--m-shadow)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--m-line) px-4 py-3">
        <span className="font-(family-name:--m-mono) text-[13px] text-(--m-muted)">Sample week of Oct 12</span>
        <div role="group" aria-label="Show week" className="inline-flex rounded-(--m-ctl) border border-(--m-line) bg-(--m-paper) p-[3px]">
          {(['before', 'after'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={state === option}
              onClick={() => choose(option)}
              className={cn(
                'rounded-[4px] px-3 py-2 text-[13px] font-semibold leading-none transition-colors duration-200',
                state === option
                  ? 'bg-(--m-surface) text-(--m-ink) shadow-[0_1px_3px_var(--m-shadow)]'
                  : 'text-(--m-muted) hover:text-(--m-ink)',
              )}
            >
              {option === 'before' ? 'Before' : 'With Margin'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[30px_repeat(5,minmax(0,1fr))] px-2 pb-4 pt-3 sm:grid-cols-[40px_repeat(5,minmax(0,1fr))] sm:px-4">
        <div />
        {DAYS.map((day) => (
          <div key={day} className="pb-2 pl-1.5 font-(family-name:--m-mono) text-xs text-(--m-muted)">
            {day}
          </div>
        ))}

        <div aria-hidden="true" className="relative h-[300px] font-(family-name:--m-mono) text-[11px] tabular-nums text-(--m-muted) sm:h-[340px]">
          <span className="absolute right-2 top-0">9a</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2">1p</span>
          <span className="absolute bottom-0 right-2">5p</span>
        </div>

        {DAYS.map((day, dayIndex) => (
          <div key={day} className="m-hours relative h-[300px] border-l border-(--m-line) sm:h-[340px]">
            {EVENTS.filter((e) => e.day === dayIndex).map((event) => (
              <m.div
                key={event.name}
                layout="position"
                transition={{ duration: 0.9, ease: EASE }}
                style={{ top: pct(event[state]), height: `calc(${pct(event.length)} - 3px)` }}
                className={cn(
                  'absolute inset-x-0.5 overflow-hidden rounded-[5px] p-[3px] text-[10px] font-medium leading-tight text-(--m-busy-ink) sm:inset-x-1 sm:px-1.5 sm:py-1 sm:text-[11px]',
                  event.external ? 'm-hatch' : 'bg-(--m-busy)',
                )}
              >
                {event.name}
              </m.div>
            ))}

            <AnimatePresence>
              {state === 'after' &&
                BLOCKS.after[dayIndex]?.map((block) => (
                  <m.div
                    key={block.start}
                    initial={{ opacity: 0, scaleY: 0.15 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0.15 }}
                    transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
                    style={{ top: pct(block.start), height: `calc(${pct(block.length)} - 3px)`, originY: 0 }}
                    className="absolute inset-x-0.5 overflow-hidden rounded-[5px] bg-(--m-mark) p-[3px] text-[10px] font-semibold leading-tight text-(--m-mark-ink) sm:inset-x-1 sm:px-1.5 sm:py-1 sm:text-[11px]"
                  >
                    Focus {formatHours(block.length)}
                  </m.div>
                ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--m-line) px-4 py-3">
        <div className="flex items-baseline gap-2">
          <m.strong aria-live="polite" className="font-(family-name:--m-display) text-[26px] font-bold leading-none tabular-nums">
            {totalLabel}
          </m.strong>
          <span className="text-[13px] text-(--m-muted)">in blocks of 2h or more</span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-(--m-muted)">
          <Legend swatch="bg-(--m-busy)">Meeting</Legend>
          <Legend swatch="m-hatch">External, never moved</Legend>
          <Legend swatch="bg-(--m-mark)">Focus</Legend>
        </div>
      </div>
    </section>
  )
}

function Legend({ swatch, children }: { swatch: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i className={cn('inline-block size-2.5 rounded-[2px]', swatch)} />
      {children}
    </span>
  )
}
