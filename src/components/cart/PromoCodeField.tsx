import { Loader2, Tag, X } from 'lucide-react'
import type { useCoupon } from '@/features/coupon/useCoupon'
import { formatPrice } from '@/lib/utils'

type CouponState = ReturnType<typeof useCoupon>

/** Promo code input and the applied-code chip that replaces it. */
export function PromoCodeField({ coupon }: { coupon: CouponState }) {
  if (coupon.applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md bg-success-surface px-3 py-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <Tag className="size-4 shrink-0 text-success" aria-hidden />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-success">
              {coupon.applied.code}
            </span>
            <span className="block text-xs text-success/80">
              −{formatPrice(coupon.discount)} applied
            </span>
          </span>
        </span>
        <button
          type="button"
          onClick={coupon.remove}
          className="shrink-0 rounded-pill p-1.5 text-success transition-colors hover:bg-success/10"
          aria-label={`Remove promo code ${coupon.applied.code}`}
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void coupon.submit()
        }}
        className="flex gap-2"
      >
        <input
          value={coupon.input}
          onChange={(event) => coupon.setInput(event.target.value)}
          placeholder="Promo code"
          aria-label="Promo code"
          aria-invalid={coupon.error ? true : undefined}
          aria-describedby={coupon.error ? 'promo-error' : undefined}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="h-11 min-w-0 flex-1 rounded-pill border border-border-subtle bg-surface-sunken px-4 text-sm uppercase transition-colors placeholder:normal-case placeholder:text-content-subtle focus:border-primary focus:bg-card focus:outline-none"
        />
        <button
          type="submit"
          disabled={coupon.isChecking || !coupon.input.trim()}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-pill bg-primary px-5 text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
        >
          {coupon.isChecking ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Apply
        </button>
      </form>
      {coupon.error ? (
        <p id="promo-error" className="mt-1.5 text-xs font-medium text-danger" role="status">
          {coupon.error}
        </p>
      ) : null}
    </div>
  )
}
