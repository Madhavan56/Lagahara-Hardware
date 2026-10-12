import type { AdminProduct } from './api'

export type StockStatus = 'in' | 'low' | 'out'

export function stockStatus(product: Pick<AdminProduct, 'stockQuantity' | 'lowStockThreshold'>): StockStatus {
  if (product.stockQuantity === 0) return 'out'
  if (product.stockQuantity <= product.lowStockThreshold) return 'low'
  return 'in'
}
