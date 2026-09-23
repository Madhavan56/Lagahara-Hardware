import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelOrder,
  fetchMyOrders,
  fetchOrderById,
  fetchOrderByNumber,
  type OrdersViewFilter,
} from './api'

const keys = {
  list: (view: OrdersViewFilter = 'active') => ['orders', view] as const,
  byId: (id: string) => ['order', id] as const,
  byNumber: (num: string) => ['order', 'number', num] as const,
}

export function useMyOrders(view: OrdersViewFilter = 'active') {
  return useQuery({
    queryKey: keys.list(view),
    queryFn: () => fetchMyOrders(view),
  })
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
    onSuccess: (_result, orderId) => {
      // Both list views can be affected (unpaid → deleted, paid → cancelled).
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: keys.byId(orderId) })
    },
  })
}
