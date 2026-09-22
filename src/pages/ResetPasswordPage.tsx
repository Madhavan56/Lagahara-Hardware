import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'

const schema = z.object({ password: z.string().min(8, 'At least 8 characters') })
type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await updatePassword(values.password)
      setDone(true)
      window.setTimeout(() => navigate('/account', { replace: true }), 1500)
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Could not update password. The reset link may have expired — request a new one.',
      )
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-sand-900">Set a new password</h1>

        {done ? (
          <p className="mt-4 text-sm text-success">Password updated. Redirecting…</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />
            {formError ? <p className="text-sm text-danger">{formError}</p> : null}
            <Button type="submit" block loading={isSubmitting}>
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
