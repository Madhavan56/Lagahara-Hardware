import { useState } from 'react'
import { SheetCalculator, type SheetCalculatorProduct } from '@/components/product/SheetCalculator'
import { Input } from '@/components/ui/input'
import { useAdminProducts } from '@/features/admin/queries'
import { formatPrice } from '@/lib/utils'

const CUSTOM = 'custom'

/** Staff quoting tool: same formulas as the storefront, any sheet product or a custom size. */
export default function AdminCalculatorPage() {
  const { data: products, isLoading } = useAdminProducts()
  const sheetProducts = (products ?? []).filter((p) => p.isSheetProduct && p.sheetLengthFt && p.sheetWidthFt)
  const [selectedId, setSelectedId] = useState('')
  const [custom, setCustom] = useState({ length: '8', width: '4', price: '' })

  const selected = sheetProducts.find((p) => p.id === selectedId)

  let calcProduct: SheetCalculatorProduct | null = null
  if (selected?.sheetLengthFt && selected.sheetWidthFt) {
    calcProduct = {
      name: selected.name,
      price: selected.price,
      sheetLengthFt: selected.sheetLengthFt,
      sheetWidthFt: selected.sheetWidthFt,
      wastagePercent: selected.wastagePercent,
      stockQuantity: selected.stockQuantity,
    }
  } else if (selectedId === CUSTOM) {
    calcProduct = {
      name: 'Custom sheet',
      price: Number(custom.price) || 0,
      sheetLengthFt: Number(custom.length),
      sheetWidthFt: Number(custom.width),
      wastagePercent: 10,
      stockQuantity: Number.POSITIVE_INFINITY,
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-h2 text-content">Sheet calculator</h1>
      <p className="mt-1 text-sm text-content-muted">Quote sheets for a customer's area. Nothing is saved.</p>

      <div className="mt-6 rounded-card border border-border-subtle bg-card p-5">
        <label htmlFor="calc-product" className="mb-1.5 block text-sm font-medium text-ink-800">
          Product
        </label>
        <select
          id="calc-product"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="h-11 w-full rounded-md border border-border-strong bg-card px-3.5 text-sm focus:border-iris-600 focus:outline-none"
        >
          <option value="">{isLoading ? 'Loading…' : 'Choose a sheet product…'}</option>
          {sheetProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.sheetLengthFt}×{p.sheetWidthFt} ft · {formatPrice(p.price)}
              {p.isActive ? '' : ' (hidden)'}
            </option>
          ))}
          <option value={CUSTOM}>Custom sheet size & price</option>
        </select>

        {selectedId === CUSTOM ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Input label="Sheet length (ft)" type="number" min={0} step="any" value={custom.length} onChange={(e) => setCustom((c) => ({ ...c, length: e.target.value }))} />
            <Input label="Sheet width (ft)" type="number" min={0} step="any" value={custom.width} onChange={(e) => setCustom((c) => ({ ...c, width: e.target.value }))} />
            <Input label="Price per sheet (₹)" type="number" min={0} step="any" value={custom.price} onChange={(e) => setCustom((c) => ({ ...c, price: e.target.value }))} />
          </div>
        ) : null}

        {selected ? (
          <p className="mt-3 text-xs text-content-muted">
            {selected.stockQuantity} in stock · default wastage {selected.wastagePercent}%
          </p>
        ) : null}
      </div>

      {calcProduct ? (
        // Keyed so switching products resets the inputs and default wastage.
        <SheetCalculator key={selectedId} product={calcProduct} className="mt-4" />
      ) : null}
    </div>
  )
}
