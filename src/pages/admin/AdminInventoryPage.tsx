import { useState } from 'react'
import { useAdminProducts, useUpdateStock } from '@/features/admin/queries'
import { cn } from '@/lib/utils'

export default function AdminInventoryPage() {
  const { data: products, isLoading } = useAdminProducts()
  const updateStock = useUpdateStock()
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const visible = (products ?? []).filter((p) => !lowStockOnly || p.stockQuantity <= p.lowStockThreshold)

  function commit(id: string, currentValue: number) {
    const draft = drafts[id]
    if (draft === undefined) return
    const next = Math.max(0, Math.round(Number(draft)))
    if (Number.isFinite(next) && next !== currentValue) {
      updateStock.mutate({ id, stockQuantity: next })
    }
    setDrafts((prev) => {
      const { [id]: _removed, ...rest } = prev
      return rest
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-content">Inventory</h1>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="size-4 rounded border-border-strong text-iris-700"
          />
          Low stock only
        </label>
      </div>

      <div className="mt-6 overflow-x-auto rounded-card border border-border-subtle bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle bg-surface text-left text-xs text-content-muted uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Threshold</th>
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
              visible.map((product) => (
                <tr key={product.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-content">{product.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-content-muted">{product.sku}</td>
                  <td className="px-4 py-3 text-ink-600">{product.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={drafts[product.id] ?? product.stockQuantity}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [product.id]: e.target.value }))}
                      onBlur={() => commit(product.id, product.stockQuantity)}
                      className={cn(
                        'h-9 w-24 rounded-sm border px-2.5 text-sm focus:border-iris-600 focus:outline-none',
                        product.stockQuantity === 0
                          ? 'border-danger text-danger'
                          : product.stockQuantity <= product.lowStockThreshold
                            ? 'border-warning text-warning'
                            : 'border-border-strong',
                      )}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
