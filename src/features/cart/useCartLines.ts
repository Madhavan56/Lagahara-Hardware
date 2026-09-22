import { useMemo } from 'react'
import { useProductsByIds } from '@/features/catalog/queries'
import type { ProductListItem } from '@/types/catalog'
import { useCartStore } from './store'

export type ResolvedCartLine = {
  product: ProductListItem
  quantity: number
  lineTotal: number
}

export function useCartLines() {
  const lines = useCartStore((state) => state.lines)
  const productIds = useMemo(() => Object.keys(lines), [lines])
  const { data: products, isLoading } = useProductsByIds(productIds)

  const resolved: ResolvedCartLine[] = useMemo(() => {
    if (!products) return []
    return products
      .map((product) => {
        const line = lines[product.id]
        if (!line) return null
        // 0 stock must clamp to 0, not fall through to the stored quantity —
        // `stockQuantity || line.quantity` would treat 0 as "unset".
        const quantity = Math.max(0, Math.min(line.quantity, product.stockQuantity))
        return { product, quantity, lineTotal: product.price * quantity }
      })
      .filter((line): line is ResolvedCartLine => line !== null)
  }, [products, lines])

  const subtotal = resolved.reduce((sum, line) => sum + line.lineTotal, 0)
  const itemCount = resolved.reduce((sum, line) => sum + line.quantity, 0)

  return { lines: resolved, subtotal, itemCount, isLoading: isLoading && productIds.length > 0 }
}
