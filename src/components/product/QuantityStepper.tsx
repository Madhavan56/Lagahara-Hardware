import { Minus, Plus } from 'lucide-react'

export function QuantityStepper({
  value,
  onChange,
  max,
  unitLabel,
}: {
  value: number
  onChange: (value: number) => void
  max: number
  unitLabel: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-xl border border-sand-300">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className="flex size-10 items-center justify-center text-sand-600 transition-colors hover:text-brand-800 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center text-sm font-medium text-sand-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex size-10 items-center justify-center text-sand-600 transition-colors hover:text-brand-800 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <span className="text-sm text-sand-500">{unitLabel}</span>
    </div>
  )
}
