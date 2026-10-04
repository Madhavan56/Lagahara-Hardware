import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { AdminCoupon, CouponInput } from '@/features/coupon/adminApi'
import {
  useAdminCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useSetCouponActive,
  useUpdateCoupon,
} from '@/features/coupon/adminQueries'
import { formatDate, formatPrice } from '@/lib/utils'

const EMPTY: CouponInput = {
  code: '',
  description: null,
  discountType: 'percent',
  discountValue: 10,
  maxDiscountAmount: null,
  minOrderAmount: 0,
  endsAt: null,
  maxRedemptions: null,
  maxRedemptionsPerUser: 1,
  isActive: true,
}

function toInput(coupon: AdminCoupon): CouponInput {
  return {
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountAmount: coupon.maxDiscountAmount,
    minOrderAmount: coupon.minOrderAmount,
    endsAt: coupon.endsAt ? coupon.endsAt.slice(0, 10) : null,
    maxRedemptions: coupon.maxRedemptions,
    maxRedemptionsPerUser: coupon.maxRedemptionsPerUser,
    isActive: coupon.isActive,
  }
}

/** Discount as a human-readable rule, e.g. "15% off, max ₹500, min order ₹2,000". */
function describeRule(coupon: AdminCoupon) {
  const base =
    coupon.discountType === 'percent'
      ? `${coupon.discountValue}% off`
      : `${formatPrice(coupon.discountValue)} off`
  const parts = [base]
  if (coupon.discountType === 'percent' && coupon.maxDiscountAmount) {
    parts.push(`max ${formatPrice(coupon.maxDiscountAmount)}`)
  }
  if (coupon.minOrderAmount > 0) parts.push(`min order ${formatPrice(coupon.minOrderAmount)}`)
  return parts.join(' · ')
}

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading, isError } = useAdminCoupons()
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon()
  const setActive = useSetCouponActive()
  const removeCoupon = useDeleteCoupon()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CouponInput | null>(null)
  const [error, setError] = useState<string | null>(null)

  function startCreate() {
    setEditingId(null)
    setForm({ ...EMPTY })
    setError(null)
  }

  function startEdit(coupon: AdminCoupon) {
    setEditingId(coupon.id)
    setForm(toInput(coupon))
    setError(null)
  }

  function update<K extends keyof CouponInput>(key: K, value: CouponInput[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!form) return
    setError(null)

    if (form.code.trim().length < 3) {
      setError('Code must be at least 3 characters')
      return
    }
    if (form.discountType === 'percent' && (form.discountValue <= 0 || form.discountValue > 100)) {
      setError('A percentage discount must be between 1 and 100')
      return
    }
    if (form.discountValue <= 0) {
      setError('Discount must be greater than zero')
      return
    }

    const payload: CouponInput = {
      ...form,
      endsAt: form.endsAt ? new Date(`${form.endsAt}T23:59:59`).toISOString() : null,
    }

    try {
      if (editingId) {
        await updateCoupon.mutateAsync({ id: editingId, input: payload })
      } else {
        await createCoupon.mutateAsync(payload)
      }
      setForm(null)
      setEditingId(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save the coupon'
      setError(message.includes('duplicate') ? 'That code already exists' : message)
    }
  }

  const saving = createCoupon.isPending || updateCoupon.isPending

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-content">Promo codes</h1>
          <p className="mt-1 text-sm text-content-muted">
            Codes are validated and applied server-side at checkout.
          </p>
        </div>
        <Button size="sm" leadingIcon={<Plus className="size-4" />} onClick={startCreate}>
          New code
        </Button>
      </div>

      {form ? (
        <Card size="lg" className="mb-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 text-content">{editingId ? 'Edit code' : 'New code'}</h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-pill p-2 text-ink-600 hover:bg-surface-sunken"
                aria-label="Close form"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Code"
                value={form.code}
                onChange={(e) => update('code', e.target.value.toUpperCase())}
                placeholder="MONSOON15"
                required
              />
              <Input
                label="Description (shown to admins only)"
                value={form.description ?? ''}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Monsoon campaign"
              />

              <div>
                <label
                  htmlFor="coupon-type"
                  className="mb-1.5 block text-sm font-semibold text-ink-800"
                >
                  Discount type
                </label>
                <select
                  id="coupon-type"
                  value={form.discountType}
                  onChange={(e) => update('discountType', e.target.value as CouponInput['discountType'])}
                  className="h-11 w-full rounded-md border border-border-subtle bg-card px-4 text-sm text-content focus:border-primary focus:outline-none"
                >
                  <option value="percent">Percentage off</option>
                  <option value="fixed">Fixed amount off</option>
                </select>
              </div>

              <Input
                label={form.discountType === 'percent' ? 'Percentage (%)' : 'Amount (₹)'}
                type="number"
                min={1}
                step="0.01"
                value={form.discountValue}
                onChange={(e) => update('discountValue', Number(e.target.value))}
                required
              />

              {form.discountType === 'percent' ? (
                <Input
                  label="Maximum discount (₹, optional)"
                  type="number"
                  min={1}
                  value={form.maxDiscountAmount ?? ''}
                  onChange={(e) =>
                    update('maxDiscountAmount', e.target.value ? Number(e.target.value) : null)
                  }
                  hint="Caps how much a percentage code can take off."
                />
              ) : null}

              <Input
                label="Minimum order value (₹)"
                type="number"
                min={0}
                value={form.minOrderAmount}
                onChange={(e) => update('minOrderAmount', Number(e.target.value) || 0)}
              />

              <Input
                label="Expires on (optional)"
                type="date"
                value={form.endsAt ?? ''}
                onChange={(e) => update('endsAt', e.target.value || null)}
              />

              <Input
                label="Total redemptions (optional)"
                type="number"
                min={1}
                value={form.maxRedemptions ?? ''}
                onChange={(e) =>
                  update('maxRedemptions', e.target.value ? Number(e.target.value) : null)
                }
                hint="Leave blank for unlimited."
              />

              <Input
                label="Uses per customer"
                type="number"
                min={1}
                value={form.maxRedemptionsPerUser}
                onChange={(e) => update('maxRedemptionsPerUser', Number(e.target.value) || 1)}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update('isActive', e.target.checked)}
                className="size-4 rounded border-border-strong text-primary"
              />
              Active
            </label>

            {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={saving}>
                {editingId ? 'Save changes' : 'Create code'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setForm(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {isError ? (
        <Card size="lg" className="text-sm text-content-muted">
          Coupons could not be loaded. Confirm the coupons migration has been applied.
        </Card>
      ) : isLoading ? (
        <Card size="lg" className="text-sm text-content-muted">
          Loading…
        </Card>
      ) : coupons.length === 0 ? (
        <Card size="lg" className="text-sm text-content-muted">
          No promo codes yet. Create one to let customers apply it at checkout.
        </Card>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => {
            const expired = coupon.endsAt ? new Date(coupon.endsAt) < new Date() : false
            const exhausted =
              coupon.maxRedemptions !== null && coupon.redemptionCount >= coupon.maxRedemptions

            return (
              <Card key={coupon.id} variant="flat" className="flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-extrabold tracking-wider text-content">
                      {coupon.code}
                    </span>
                    {!coupon.isActive ? (
                      <Badge variant="neutral" size="sm">
                        Paused
                      </Badge>
                    ) : expired ? (
                      <Badge variant="danger" size="sm">
                        Expired
                      </Badge>
                    ) : exhausted ? (
                      <Badge variant="warning" size="sm">
                        Fully claimed
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        Live
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-700">{describeRule(coupon)}</p>
                  <p className="mt-0.5 text-xs text-content-muted">
                    Used {coupon.redemptionCount}
                    {coupon.maxRedemptions ? ` of ${coupon.maxRedemptions}` : ''} ·{' '}
                    {coupon.maxRedemptionsPerUser} per customer
                    {coupon.endsAt ? ` · expires ${formatDate(coupon.endsAt)}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => setActive.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                  >
                    {coupon.isActive ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leadingIcon={<Pencil className="size-4" />}
                    onClick={() => startEdit(coupon)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leadingIcon={<Trash2 className="size-4" />}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete ${coupon.code}? Orders that already used it keep their discount.`,
                        )
                      ) {
                        removeCoupon.mutate(coupon.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
