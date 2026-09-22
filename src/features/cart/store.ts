import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartLine = {
  productId: string
  quantity: number
}

type CartState = {
  lines: Record<string, CartLine>
  addItem: (productId: string, quantity: number, maxQuantity: number) => void
  setQuantity: (productId: string, quantity: number, maxQuantity: number) => void
  removeItem: (productId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: {},

      addItem: (productId, quantity, maxQuantity) =>
        set((state) => {
          const existing = state.lines[productId]
          const nextQuantity = Math.min(maxQuantity, (existing?.quantity ?? 0) + quantity)
          return {
            lines: {
              ...state.lines,
              [productId]: { productId, quantity: nextQuantity },
            },
          }
        }),

      setQuantity: (productId, quantity, maxQuantity) =>
        set((state) => {
          if (quantity <= 0) {
            const { [productId]: _removed, ...rest } = state.lines
            return { lines: rest }
          }
          return {
            lines: {
              ...state.lines,
              [productId]: { productId, quantity: Math.min(maxQuantity, quantity) },
            },
          }
        }),

      removeItem: (productId) =>
        set((state) => {
          const { [productId]: _removed, ...rest } = state.lines
          return { lines: rest }
        }),

      clear: () => set({ lines: {} }),
    }),
    { name: 'laghara-cart' },
  ),
)

export function useCartCount() {
  return useCartStore((state) => Object.values(state.lines).reduce((sum, line) => sum + line.quantity, 0))
}
