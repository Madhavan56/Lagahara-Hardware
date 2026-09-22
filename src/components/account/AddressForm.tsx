import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Address, AddressInput } from '@/types/account'

const schema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2, 'Required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  line1: z.string().min(3, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  postalCode: z.string().min(4, 'Required'),
  country: z.string().min(2, 'Required'),
})
type FormValues = z.infer<typeof schema>

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Address
  onSubmit: (input: AddressInput) => void
  onCancel: () => void
  submitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: initial?.label ?? '',
      fullName: initial?.fullName ?? '',
      phone: initial?.phone ?? '',
      line1: initial?.line1 ?? '',
      line2: initial?.line2 ?? '',
      city: initial?.city ?? '',
      state: initial?.state ?? '',
      postalCode: initial?.postalCode ?? '',
      country: initial?.country ?? 'India',
    },
  })

  function submit(values: FormValues) {
    onSubmit({
      label: values.label || null,
      fullName: values.fullName,
      phone: values.phone,
      line1: values.line1,
      line2: values.line2 || null,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 rounded-card border border-sand-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Label (e.g. Home, Site)" {...register('label')} />
        <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
      </div>
      <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
      <Input label="Address line 1" error={errors.line1?.message} {...register('line1')} />
      <Input label="Address line 2 (optional)" {...register('line2')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="City" error={errors.city?.message} {...register('city')} />
        <Input label="State" error={errors.state?.message} {...register('state')} />
        <Input label="Postal code" error={errors.postalCode?.message} {...register('postalCode')} />
      </div>
      <Input label="Country" error={errors.country?.message} {...register('country')} />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          Save address
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
