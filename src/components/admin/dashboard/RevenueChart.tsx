import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { DashboardDay } from '@/features/admin/api'
import { DURATION, EASE } from '@/lib/motion'
import { formatPrice } from '@/lib/utils'

const HEIGHT = 240
const PAD = { top: 16, right: 12, bottom: 28, left: 56 }

const compactInr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const dayLabel = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
const fullDayLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

function parseDay(key: string) {
  const [y, mo, d] = key.split('-').map(Number)
  return new Date(y!, mo! - 1, d!)
}

/** Rounds the axis max up to 1/2/2.5/5 × 10ⁿ so gridlines land on readable values. */
function niceMax(value: number) {
  if (value <= 0) return 1000
  const exp = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (value <= step * exp) return step * exp
  }
  return 10 * exp
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry!.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/**
 * Daily revenue as a single-series area chart (form: change over time). One
 * hue, no legend (the card title names the series), recessive grid, crosshair
 * tooltip on hover/arrow keys, and an equivalent table for screen readers.
 */
export function RevenueChart({ days }: { days: DashboardDay[] }) {
  const id = useId()
  const reduce = useReducedMotion()
  const [wrapRef, width] = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const geometry = useMemo(() => {
    if (!width || days.length < 2) return null
    const innerW = width - PAD.left - PAD.right
    const innerH = HEIGHT - PAD.top - PAD.bottom
    const max = niceMax(Math.max(...days.map((d) => d.revenue)))
    const x = (i: number) => PAD.left + (i / (days.length - 1)) * innerW
    const y = (v: number) => PAD.top + innerH - (v / max) * innerH
    const points = days.map((d, i) => [x(i), y(d.revenue)] as const)
    const line = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ')
    const baseline = PAD.top + innerH
    const area = `${line} L${points.at(-1)![0].toFixed(1)},${baseline} L${points[0]![0].toFixed(1)},${baseline} Z`
    const ticks = [0, max / 2, max]
    return { x, y, points, line, area, baseline, ticks, innerW }
  }, [width, days])

  function indexFromPointer(event: PointerEvent<SVGSVGElement>) {
    if (!geometry) return null
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left - PAD.left) / geometry.innerW
    return Math.max(0, Math.min(days.length - 1, Math.round(ratio * (days.length - 1))))
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const delta = event.key === 'ArrowLeft' ? -1 : 1
    setActive((current) => Math.max(0, Math.min(days.length - 1, (current ?? days.length - 1) + delta)))
  }

  const activeDay = active === null ? null : days[active]
  const activePoint = active === null || !geometry ? null : geometry.points[active]
  const labelEvery = width < 520 ? 4 : 2

  return (
    <div ref={wrapRef} className="relative">
      {geometry ? (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-labelledby={`${id}-desc`}
          tabIndex={0}
          className="block touch-pan-y rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onPointerMove={(e) => setActive(indexFromPointer(e))}
          onPointerDown={(e) => setActive(indexFromPointer(e))}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
          onKeyDown={onKeyDown}
        >
          <desc id={`${id}-desc`}>
            Daily revenue for the last {days.length} days. Use the left and right arrow keys to read each day.
          </desc>
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {geometry.ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={geometry.y(tick)}
                y2={geometry.y(tick)}
                stroke="var(--color-ink-200)"
                strokeDasharray={tick === 0 ? undefined : '3 4'}
              />
              <text
                x={PAD.left - 10}
                y={geometry.y(tick)}
                dy="0.32em"
                textAnchor="end"
                className="fill-ink-500 text-[11px] tabular-nums"
              >
                {compactInr.format(tick)}
              </text>
            </g>
          ))}

          {days.map((day, i) =>
            i % labelEvery === (days.length - 1) % labelEvery ? (
              <text
                key={day.date}
                x={geometry.x(i)}
                y={HEIGHT - 8}
                textAnchor={i === days.length - 1 ? 'end' : 'middle'}
                className="fill-ink-500 text-[11px]"
              >
                {i === days.length - 1 ? 'Today' : dayLabel.format(parseDay(day.date))}
              </text>
            ) : null,
          )}

          <m.path
            d={geometry.area}
            fill={`url(#${id}-fill)`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.slow, delay: 0.35, ease: EASE.soft }}
          />
          <m.path
            d={geometry.line}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: EASE.expo }}
          />

          {activePoint ? (
            <g pointerEvents="none">
              <line
                x1={activePoint[0]}
                x2={activePoint[0]}
                y1={PAD.top}
                y2={geometry.baseline}
                stroke="var(--color-ink-300)"
              />
              <circle cx={activePoint[0]} cy={activePoint[1]} r={5} fill="var(--color-primary)" stroke="var(--color-card)" strokeWidth={2} />
            </g>
          ) : null}
        </svg>
      ) : (
        <div style={{ height: HEIGHT }} />
      )}

      {activeDay && activePoint ? (
        <div
          className="pointer-events-none absolute z-10 min-w-36 rounded-md bg-ink-950 px-3 py-2 text-xs text-ink-50 shadow-lift"
          style={{
            left: Math.min(Math.max(activePoint[0], 80), width - 80),
            top: activePoint[1] - 12,
            transform: 'translate(-50%, -100%)',
          }}
          role="status"
        >
          <p className="text-ink-300">{fullDayLabel.format(parseDay(activeDay.date))}</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">{formatPrice(activeDay.revenue)}</p>
          <p className="text-ink-300 tabular-nums">
            {activeDay.orders} {activeDay.orders === 1 ? 'order' : 'orders'}
          </p>
        </div>
      ) : null}

      <table className="sr-only">
        <caption>Daily revenue, last {days.length} days</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Revenue</th>
            <th scope="col">Orders</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{fullDayLabel.format(parseDay(d.date))}</td>
              <td>{formatPrice(d.revenue)}</td>
              <td>{d.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
