import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WishlistState = {
  productIds: string[]
  toggle: (productId: string) => void
  remove: (productId: string) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      productIds: [],

      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),

      remove: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
    }),
    { name: 'dhuraj-wishlist' },
  ),
)

export function useIsWishlisted(productId: string) {
  return useWishlistStore((state) => state.productIds.includes(productId))
}

export function useWishlistCount() {
  return useWishlistStore((state) => state.productIds.length)
}
