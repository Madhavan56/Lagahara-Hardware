import { supabase } from '@/lib/supabase/client'

export type CouponDiscountType = 'percent' | 'fixed'

export type AdminCoupon = {
  id: string
  code: string
  description: string | null
  discountType: CouponDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  minOrderAmount: number
  startsAt: string | null
  endsAt: string | null
  maxRedemptions: number | null
  maxRedemptionsPerUser: number
  redemptionCount: number
  isActive: boolean
  createdAt: string
}

export type CouponInput = {
  code: string
  description: string | null
  discountType: CouponDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  minOrderAmount: number
  endsAt: string | null
  maxRedemptions: number | null
  maxRedemptionsPerUser: number
  isActive: boolean
}

type Row = Record<string, unknown>

function mapCoupon(row: Row): AdminCoupon {
  return {
    id: String(row.id),
    code: String(row.code),
    description: (row.description as string | null) ?? null,
    discountType: row.discount_type as CouponDiscountType,
    discountValue: Number(row.discount_value ?? 0),
    maxDiscountAmount: row.max_discount_amount == null ? null : Number(row.max_discount_amount),
    minOrderAmount: Number(row.min_order_amount ?? 0),
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    maxRedemptions: row.max_redemptions == null ? null : Number(row.max_redemptions),
    maxRedemptionsPerUser: Number(row.max_redemptions_per_user ?? 1),
    redemptionCount: Number(row.redemption_count ?? 0),
    isActive: row.is_active === true,
    createdAt: String(row.created_at),
  }
}

const SELECT =
  'id, code, description, discount_type, discount_value, max_discount_amount, min_order_amount, starts_at, ends_at, max_redemptions, max_redemptions_per_user, redemption_count, is_active, created_at'

export async function fetchCoupons(): Promise<AdminCoupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select(SELECT)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapCoupon(row as Row))
}

/** `code` is normalised here to match the uppercase check constraint. */
function toRow(input: CouponInput) {
  return {
    code: input.code.trim().toUpperCase(),
    description: input.description?.trim() || null,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    max_discount_amount: input.discountType === 'percent' ? input.maxDiscountAmount : null,
    min_order_amount: input.minOrderAmount,
    ends_at: input.endsAt,
    max_redemptions: input.maxRedemptions,
    max_redemptions_per_user: input.maxRedemptionsPerUser,
    is_active: input.isActive,
  }
}

export async function createCoupon(input: CouponInput): Promise<void> {
  const { error } = await supabase.from('coupons').insert(toRow(input))
  if (error) throw error
}

export async function updateCoupon(id: string, input: CouponInput): Promise<void> {
  const { error } = await supabase.from('coupons').update(toRow(input)).eq('id', id)
  if (error) throw error
}

export async function setCouponActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('coupons').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) throw error
}
