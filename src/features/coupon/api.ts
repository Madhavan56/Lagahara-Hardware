import { supabase } from '@/lib/supabase/client'

export type CouponPreview = {
  valid: boolean
  /** Human-readable rejection shown verbatim; null when valid. */
  reason: string | null
  couponId: string | null
  code: string | null
  description: string | null
  discountAmount: number
}

type ValidateCouponRow = {
  valid: boolean
  reason: string | null
  coupon_id: string | null
  code: string | null
  description: string | null
  discount_amount: number | string | null
}

/**
 * Previews a promo code against the current subtotal.
 *
 * This is advisory only — `create-order` re-validates the code and recomputes
 * the discount from the coupon row before it writes anything, so a tampered
 * response here cannot produce a cheaper order.
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponPreview> {
  const { data, error } = await supabase
    .rpc('validate_coupon', { p_code: code, p_subtotal: subtotal })
    .maybeSingle<ValidateCouponRow>()

  if (error) throw new Error('Could not check that code right now')
  if (!data) {
    return {
      valid: false,
      reason: 'That promo code is not valid',
      couponId: null,
      code: null,
      description: null,
      discountAmount: 0,
    }
  }

  return {
    valid: data.valid === true,
    reason: data.reason,
    couponId: data.coupon_id,
    code: data.code,
    description: data.description,
    discountAmount: Number(data.discount_amount ?? 0),
  }
}
