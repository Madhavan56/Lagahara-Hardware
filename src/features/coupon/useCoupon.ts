import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { validateCoupon } from './api'
import { useCouponStore } from './store'

/**
 * Drives the promo-code field. Re-checks the applied code whenever the cart
 * subtotal moves, so a coupon that stops qualifying (cart emptied below the
 * minimum, allowance used up elsewhere) drops off on its own rather than
 * failing at the moment of payment.
 */
export function useCoupon(subtotal: number) {
  const { user } = useAuth()
  const applied = useCouponStore((state) => state.applied)
  const apply = useCouponStore((state) => state.apply)
  const setDiscount = useCouponStore((state) => state.setDiscount)
  const clear = useCouponStore((state) => state.clear)

  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const appliedCode = applied?.code ?? null

  useEffect(() => {
    if (!appliedCode) return

    // Signing out invalidates the code — validate_coupon() is per-user.
    if (!user) {
      clear()
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const preview = await validateCoupon(appliedCode, subtotal)
        if (cancelled) return
        if (preview.valid) {
          setDiscount(preview.discountAmount)
        } else {
          clear()
          setError(preview.reason ?? 'That promo code is no longer valid')
        }
      } catch {
        // Leave the code applied on a transient failure; create-order is the
        // authority and will reject it there if it genuinely no longer holds.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [appliedCode, subtotal, user, clear, setDiscount])

  const submit = useCallback(async () => {
    const code = input.trim().toUpperCase()
    if (!code) return

    if (!user) {
      setError('Sign in to use a promo code')
      return
    }

    setIsChecking(true)
    setError(null)
    try {
      const preview = await validateCoupon(code, subtotal)
      if (preview.valid && preview.code) {
        apply({
          code: preview.code,
          description: preview.description,
          discountAmount: preview.discountAmount,
        })
        setInput('')
      } else {
        setError(preview.reason ?? 'That promo code is not valid')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check that code')
    } finally {
      setIsChecking(false)
    }
  }, [input, subtotal, user, apply])

  const remove = useCallback(() => {
    clear()
    setError(null)
  }, [clear])

  // Never show a discount larger than the cart itself.
  const discount = applied ? Math.min(applied.discountAmount, subtotal) : 0

  return { applied, discount, input, setInput, error, isChecking, submit, remove }
}
