import { useMutation } from '@tanstack/react-query'
import { createOrder, verifyPayment } from './api'

export function useCreateOrder() {
  return useMutation({ mutationFn: createOrder })
}

export function useVerifyPayment() {
  return useMutation({ mutationFn: verifyPayment })
}
