import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelOrder, fetchMyOrders, fetchOrderById, fetchOrderByNumber } from './api'

const keys = {
  list: ['orders'] as const,
  byId: (id: string) => ['order', id] as const,
  byNumber: (num: string) => ['order', 'number', num] as const,
}

export function useMyOrders() {
  return useQuery({ queryKey: keys.list, queryFn: fetchMyOrders })
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: keys.byId(orderId ?? ''),
    queryFn: () => fetchOrderById(orderId as string),
    enabled: Boolean(orderId),
  })
}

export function useOrderByNumber(orderNumber: string | undefined) {
  return useQuery({
    queryKey: keys.byNumber(orderNumber ?? ''),
    queryFn: () => fetchOrderByNumber(orderNumber as string),
    enabled: Boolean(orderNumber),
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.list })
    },
  })
}
