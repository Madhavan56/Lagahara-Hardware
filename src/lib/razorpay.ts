/**
 * Loads Razorpay's checkout.js once, on demand — the ~50KB script is never
 * part of the initial bundle. Resolves with the constructor to open checkout.
 */
let loaderPromise: Promise<RazorpayConstructor> | null = null

export type RazorpayConstructor = new (options: RazorpayOptions) => {
  open: () => void
  on: (event: string, handler: (payload: unknown) => void) => void
}

export type RazorpayOptions = {
  key: string
  order_id: string
  amount: number
  currency: string
  name: string
  description?: string
  image?: string
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
  handler?: (response: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => void
}

export function loadRazorpay(): Promise<RazorpayConstructor> {
  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise<RazorpayConstructor>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay can only load in the browser'))
      return
    }
    const existing = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay
    if (existing) {
      resolve(existing)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      const ctor = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay
      if (ctor) {
        resolve(ctor)
      } else {
        reject(new Error('Razorpay loaded but was not available'))
      }
    }
    script.onerror = () => {
      loaderPromise = null
      reject(new Error('Could not load the payment gateway. Check your connection and retry.'))
    }
    document.head.appendChild(script)
  })

  return loaderPromise
}
