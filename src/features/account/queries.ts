import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AddressInput } from '@/types/account'
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchProfile,
  setDefaultAddress,
  updateAddress,
  updateProfile,
} from './api'

const keys = {
  profile: (userId: string) => ['profile', userId] as const,
  addresses: (userId: string) => ['addresses', userId] as const,
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: keys.profile(userId ?? ''),
    queryFn: () => fetchProfile(userId as string),
    enabled: Boolean(userId),
  })
}

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { fullName: string; phone: string }) => updateProfile(userId as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.profile(userId ?? '') })
    },
  })
}

export function useAddresses(userId: string | undefined) {
  return useQuery({
    queryKey: keys.addresses(userId ?? ''),
    queryFn: () => fetchAddresses(userId as string),
    enabled: Boolean(userId),
  })
}

export function useCreateAddress(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ input, makeDefault }: { input: AddressInput; makeDefault: boolean }) =>
      createAddress(userId as string, input, makeDefault),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.addresses(userId ?? '') })
    },
  })
}

export function useUpdateAddress(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ addressId, input }: { addressId: string; input: AddressInput }) =>
      updateAddress(addressId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.addresses(userId ?? '') })
    },
  })
}

export function useDeleteAddress(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (addressId: string) => deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.addresses(userId ?? '') })
    },
  })
}

export function useSetDefaultAddress(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (addressId: string) => setDefaultAddress(userId as string, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.addresses(userId ?? '') })
    },
  })
}
