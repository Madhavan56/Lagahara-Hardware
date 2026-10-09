import { Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AddressForm } from '@/components/account/AddressForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from '@/features/account/queries'
import type { Address, AddressInput } from '@/types/account'
import { Skeleton } from '@/components/ui/skeleton'

export default function AddressesTab() {
  const { user } = useAuth()
  const { data: addresses = [], isLoading } = useAddresses(user?.id)
  const createAddress = useCreateAddress(user?.id)
  const updateAddress = useUpdateAddress(user?.id)
  const deleteAddress = useDeleteAddress(user?.id)
  const setDefaultAddress = useSetDefaultAddress(user?.id)

  const [mode, setMode] = useState<'idle' | 'create' | { edit: Address }>('idle')

  function handleCreate(input: AddressInput) {
    createAddress.mutate(
      { input, makeDefault: addresses.length === 0 },
      { onSuccess: () => setMode('idle') },
    )
  }

  function handleUpdate(addressId: string, input: AddressInput) {
    updateAddress.mutate({ addressId, input }, { onSuccess: () => setMode('idle') })
  }

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading addresses" className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-card" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      {addresses.map((address) => (
        <div key={address.id} className="rounded-card border border-border-subtle bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-content">
                  {address.label || 'Address'}
                </p>
                {address.isDefault ? <Badge variant="brand" size="sm">Default</Badge> : null}
              </div>
              <p className="mt-1.5 text-sm text-ink-700">{address.fullName}</p>
              <p className="text-sm text-ink-600">{address.phone}</p>
              <p className="mt-1 text-sm text-ink-600">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state}{' '}
                {address.postalCode}, {address.country}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              {!address.isDefault ? (
                <button
                  type="button"
                  onClick={() => setDefaultAddress.mutate(address.id)}
                  className="rounded-sm p-2 text-content-muted hover:bg-surface-sunken hover:text-iris-800"
                  title="Set as default"
                >
                  <Star className="size-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => deleteAddress.mutate(address.id)}
                className="rounded-sm p-2 text-content-muted hover:bg-surface-sunken hover:text-danger"
                title="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMode({ edit: address })}
            className="mt-3 text-xs font-medium text-iris-700 hover:text-iris-900"
          >
            Edit
          </button>
        </div>
      ))}

      {mode === 'create' ? (
        <AddressForm onSubmit={handleCreate} onCancel={() => setMode('idle')} submitting={createAddress.isPending} />
      ) : typeof mode === 'object' ? (
        <AddressForm
          initial={mode.edit}
          onSubmit={(input) => handleUpdate(mode.edit.id, input)}
          onCancel={() => setMode('idle')}
          submitting={updateAddress.isPending}
        />
      ) : (
        <Button variant="outline" leadingIcon={<Plus className="size-4" />} onClick={() => setMode('create')}>
          Add address
        </Button>
      )}
    </div>
  )
}
