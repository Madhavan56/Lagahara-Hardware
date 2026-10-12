import { Calculator, ShoppingBag } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { calculateSheets, LENGTH_UNITS, MAX_WASTAGE_PERCENT, type LengthUnit } from '@/lib/sheetCalculator'
import { cn, formatPrice } from '@/lib/utils'

export type SheetCalculatorProduct = {
  name: string
  price: number
  sheetLengthFt: number
  sheetWidthFt: number
  wastagePercent: number
  stockQuantity: number
}

const FIELD =
  'h-11 w-full rounded-md border border-border-subtle bg-card px-3.5 text-sm text-content transition-[border-color,box-shadow] duration-(--duration-fast) hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_4px_rgb(108_77_217/0.14)] focus:outline-none'

const sqft = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

function formatFeet(value: number) {
  return sqft.format(value)
}

/**
 * Area → sheets estimator. All math lives in lib/sheetCalculator; this only
 * collects input and renders the result. `onAddToCart` is omitted on the
 * admin quote page.
 */
export function SheetCalculator({
  product,
  onAddToCart,
  className,
}: {
  product: SheetCalculatorProduct
  onAddToCart?: (sheets: number) => void
  className?: string
}) {
  const id = useId()
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [unit, setUnit] = useState<LengthUnit>('ft')
  const [wastage, setWastage] = useState(String(product.wastagePercent))

  const touched = length !== '' || width !== ''
  const outcome = touched
    ? calculateSheets({
        length: Number(length),
        width: Number(width),
        unit,
        wastagePercent: wastage === '' ? 0 : Number(wastage),
        sheetLengthFt: product.sheetLengthFt,
        sheetWidthFt: product.sheetWidthFt,
        pricePerSheet: product.price,
      })
    : null
  const result = outcome?.ok ? outcome.result : null
  const notEnoughStock = result ? result.sheetsRequired > product.stockQuantity : false

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn('rounded-card border border-border-subtle bg-card p-5', className)}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-pill bg-primary-soft text-primary">
          <Calculator className="size-4" aria-hidden />
        </span>
        <div>
          <h2 id={`${id}-title`} className="text-sm font-bold text-content">
            How many sheets do I need?
          </h2>
          <p className="text-xs text-content-muted">
            Sheet size {formatFeet(product.sheetLengthFt)} × {formatFeet(product.sheetWidthFt)} ft
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Measurement unit">
        {LENGTH_UNITS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={unit === option.value}
            onClick={() => setUnit(option.value)}
            className={cn(
              'rounded-pill px-3.5 py-1.5 text-xs font-bold transition-colors',
              unit === option.value ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-ink-700 hover:text-primary',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-800">Length ({unit})</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className={FIELD}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-800">Width ({unit})</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className={FIELD}
          />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="mb-1 block text-xs font-semibold text-ink-800">Wastage (%)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={MAX_WASTAGE_PERCENT}
            step="any"
            value={wastage}
            onChange={(e) => setWastage(e.target.value)}
            className={FIELD}
          />
        </label>
      </div>

      <div aria-live="polite" className="mt-4">
        {outcome && !outcome.ok ? (
          <p className="text-sm font-medium text-danger">{outcome.error}</p>
        ) : result ? (
          <>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-surface-sunken p-4 text-sm">
              <dt className="text-content-muted">Area</dt>
              <dd className="text-right font-semibold text-content">{formatFeet(result.areaSqFt)} sq ft</dd>
              <dt className="text-content-muted">With wastage</dt>
              <dd className="text-right font-semibold text-content">{formatFeet(result.areaWithWastageSqFt)} sq ft</dd>
              <dt className="text-content-muted">Per sheet</dt>
              <dd className="text-right font-semibold text-content">{formatFeet(result.sheetAreaSqFt)} sq ft</dd>
              <dt className="text-content-muted">Sheets needed</dt>
              <dd className="text-right text-base font-extrabold text-primary">{result.sheetsRequired}</dd>
              <dt className="text-content-muted">Estimated price</dt>
              <dd className="text-right text-base font-extrabold text-content">{formatPrice(result.estimatedPrice)}</dd>
            </dl>
            {onAddToCart ? (
              <>
                <Button
                  type="button"
                  block
                  className="mt-3"
                  disabled={notEnoughStock}
                  onClick={() => onAddToCart(result.sheetsRequired)}
                  leadingIcon={<ShoppingBag className="size-4" />}
                >
                  Add {result.sheetsRequired} {result.sheetsRequired === 1 ? 'sheet' : 'sheets'} to cart
                </Button>
                {notEnoughStock ? (
                  <p className="mt-2 text-xs font-medium text-warning">
                    Only {product.stockQuantity} in stock. Contact us for larger orders.
                  </p>
                ) : null}
              </>
            ) : null}
          </>
        ) : (
          <p className="text-xs text-content-muted">Enter the length and width of the area you're covering.</p>
        )}
      </div>
    </section>
  )
}
