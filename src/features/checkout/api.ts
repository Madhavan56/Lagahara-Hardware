import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export type CreateOrderInput = {
  addressId: string
  shippingMethodCode: string
  items: { productId: string; quantity: number }[]
  customerNote?: string
}

export type CreateOrderResult = {
  orderId: string
  orderNumber: string
  subtotal: number
  shippingAmount: number
  total: number
}

export type CreateOrderError = {
  error: string
  details?: unknown
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { data, error } = await supabase.functions.invoke<CreateOrderResult>('create-order', {
    body: input,
  })

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const body = (await error.context.clone().json()) as CreateOrderError
        throw new Error(body.error || error.message)
      } catch {
        // fall through to generic error below
      }
    }
    throw new Error(error.message)
  }

  if (!data) throw new Error('No response from server')
  return data
}
