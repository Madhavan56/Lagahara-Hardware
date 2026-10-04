import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCoupon,
  deleteCoupon,
  fetchCoupons,
  setCouponActive,
  updateCoupon,
  type CouponInput,
} from './adminApi'

const couponKeys = { all: ['admin', 'coupons'] as const }

export function useAdminCoupons() {
  return useQuery({ queryKey: couponKeys.all, queryFn: fetchCoupons })
}

function useCouponMutation<TArgs>(fn: (args: TArgs) => Promise<void>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couponKeys.all }),
  })
}

export function useCreateCoupon() {
  return useCouponMutation((input: CouponInput) => createCoupon(input))
}

export function useUpdateCoupon() {
  return useCouponMutation(({ id, input }: { id: string; input: CouponInput }) =>
    updateCoupon(id, input),
  )
}

export function useSetCouponActive() {
  return useCouponMutation(({ id, isActive }: { id: string; isActive: boolean }) =>
    setCouponActive(id, isActive),
  )
}

export function useDeleteCoupon() {
  return useCouponMutation((id: string) => deleteCoupon(id))
}
