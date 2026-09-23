import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export type CreateOrderInput = {
  addressId: string
  shippingMethodCode: string
  items: { productId: string; quantity: number }[]
  customerNote?: string
}

export type RazorpayCheckoutParams = {
  orderId: string
  amountInPaise: number
  currency: string
  keyId: string
}

export type CreateOrderResult = {
  orderId: string
  orderNumber: string
  subtotal: number
  shippingAmount: number
  total: number
  razorpay: RazorpayCheckoutParams
}

export type CreateOrderError = {
  error: string
  details?: unknown
}

export type VerifyPaymentInput = {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export type VerifyPaymentResult = {
  ok: boolean
  orderId: string
  orderNumber: string
}

async function functionsErrorToMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.clone().json()) as { error?: string }
      if (body.error) return body.error
    } catch {
      // fall through
    }
  }
  return fallback
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { data, error } = await supabase.functions.invoke<CreateOrderResult>('create-order', {
    body: input,
  })

  if (error) {
    throw new Error(await functionsErrorToMessage(error, error.message))
  }
  if (!data) throw new Error('No response from server')
  return data
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  const { data, error } = await supabase.functions.invoke<VerifyPaymentResult>('verify-payment', {
    body: input,
  })

  if (error) {
    throw new Error(await functionsErrorToMessage(error, 'Payment verification failed'))
  }
  if (!data) throw new Error('No response from server')
  return data
}

/**
 * Customer cancellation. Prefers the cancel_order RPC (deleted unpaid orders /
 * flags paid ones); falls back to the cancel-order edge function, which has
 * identical semantics, when the RPC is not yet available.
 */
export async function cancelOrderById(orderId: string): Promise<{ removed: boolean }> {
  const { error: rpcError } = await supabase.rpc('cancel_order', { p_order_id: orderId })
  if (!rpcError) return { removed: true }

  const { data, error } = await supabase.functions.invoke<{ ok: boolean; removed: boolean }>(
    'cancel-order',
    { body: { orderId } },
  )
  if (error) {
    throw new Error(await functionsErrorToMessage(error, 'Order cannot be cancelled'))
  }
  if (!data) throw new Error('No response from server')
  return { removed: data.removed }
}
