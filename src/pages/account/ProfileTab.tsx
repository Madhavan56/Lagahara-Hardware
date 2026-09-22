import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'
import { useProfile, useUpdateProfile } from '@/features/account/queries'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z.string().min(10, 'Enter a valid phone number'),
})
type FormValues = z.infer<typeof schema>

export default function ProfileTab() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile(user?.id)
  const updateProfile = useUpdateProfile(user?.id)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (profile) {
      reset({ fullName: profile.fullName ?? '', phone: profile.phone ?? '' })
    }
  }, [profile, reset])

  async function onSubmit(values: FormValues) {
    setSaved(false)
    await updateProfile.mutateAsync(values)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading) {
    return <p className="text-sm text-sand-500">Loading…</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
      <Input label="Email" value={user?.email ?? ''} disabled hint="Email cannot be changed here" />

      {saved ? <p className="text-sm text-success">Profile updated.</p> : null}

      <Button type="submit" loading={isSubmitting}>
        Save changes
      </Button>
    </form>
  )
}
