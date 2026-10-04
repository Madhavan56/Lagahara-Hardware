import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AppliedCoupon = {
  code: string
  description: string | null
  /** Last previewed discount. Always re-checked against the live subtotal. */
  discountAmount: number
}

type CouponState = {
  applied: AppliedCoupon | null
  apply: (coupon: AppliedCoupon) => void
  /** Refreshes the amount when the cart subtotal changes. */
  setDiscount: (discountAmount: number) => void
  clear: () => void
}

/**
 * The code the shopper has applied, held alongside the cart so it survives a
 * reload and the trip to the checkout page. The amount here is for display
 * only; the order total is always computed server-side.
 */
export const useCouponStore = create<CouponState>()(
  persist(
    (set) => ({
      applied: null,
      apply: (coupon) => set({ applied: coupon }),
      setDiscount: (discountAmount) =>
        set((state) => (state.applied ? { applied: { ...state.applied, discountAmount } } : state)),
      clear: () => set({ applied: null }),
    }),
    { name: 'laghara-coupon' },
  ),
)
