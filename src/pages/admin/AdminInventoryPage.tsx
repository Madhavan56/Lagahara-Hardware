import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminProducts, useUpdateLowStockThreshold, useUpdateStock } from '@/features/admin/queries'
import { stockStatus } from '@/features/admin/stock'
import { showToast } from '@/features/toast/store'
import { cn } from '@/lib/utils'

type Field = 'stock' | 'threshold'
const draftKey = (id: string, field: Field) => `${id}:${field}`

export default function AdminInventoryPage() {
  const { data: products, isLoading } = useAdminProducts()
  const updateStock = useUpdateStock()
  const updateThreshold = useUpdateLowStockThreshold()
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const visible = (products ?? []).filter((p) => !lowStockOnly || stockStatus(p) !== 'in')

  function commit(id: string, field: Field, currentValue: number) {
    const key = draftKey(id, field)
    const draft = drafts[key]
    setDrafts(({ [key]: _removed, ...rest }) => rest)
    if (draft === undefined) return
    const next = Number(draft)
    if (!Number.isInteger(next) || next < 0) {
      showToast({ tone: 'error', title: 'Enter a whole number, 0 or more.' })
      return
    }
    if (next === currentValue) return
    const onError = (err: Error) => showToast({ tone: 'error', title: err.message })
    if (field === 'stock') updateStock.mutate({ id, stockQuantity: next }, { onError })
    else updateThreshold.mutate({ id, threshold: next }, { onError })
  }

  function numberCell(id: string, field: Field, value: number, className?: string) {
    const key = draftKey(id, field)
    return (
      <input
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        aria-label={field === 'stock' ? 'Stock quantity' : 'Low-stock threshold'}
        value={drafts[key] ?? value}
        onChange={(e) => setDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
        onBlur={() => commit(id, field, value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        className={cn(
          'h-9 w-24 rounded-sm border border-border-strong px-2.5 text-sm focus:border-iris-600 focus:outline-none',
          className,
        )}
      />
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h2 text-content">Inventory</h1>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="size-4 rounded border-border-strong text-iris-700"
          />
          Low & out of stock only
        </label>
      </div>
      <p className="mt-1 text-sm text-content-muted">
        Edit a number and press Enter or click away to save. Confirmed orders reduce stock automatically.
      </p>

      <div className="mt-6 overflow-x-auto rounded-card border border-border-subtle bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-border-subtle bg-surface text-left text-xs text-content-muted uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Low-stock threshold</th>
              <th className="px-4 py-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-content-muted">
                  Loading…
                </td>
              </tr>
            ) : (
              visible.map((product) => {
                const status = stockStatus(product)
                return (
                  <tr key={product.id} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/admin/products/${product.id}`} className="text-content hover:text-primary">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-content-muted">{product.sku}</td>
                    <td className="px-4 py-3">{numberCell(product.id, 'threshold', product.lowStockThreshold)}</td>
                    <td className="px-4 py-3">
                      {numberCell(
                        product.id,
                        'stock',
                        product.stockQuantity,
                        status === 'out' ? 'border-danger text-danger' : status === 'low' ? 'border-warning text-warning' : undefined,
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
