import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'

const schema = z.object({ email: z.email('Enter a valid email address') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await requestPasswordReset(values.email)
      setSent(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not send reset email')
    }
  }

  if (sent) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-sand-900">Check your email</h1>
          <p className="mt-3 text-sand-600">
            If an account exists for that address, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="mt-6 inline-block text-sm font-medium text-brand-700">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-sand-900">Reset your password</h1>
        <p className="mt-1.5 text-sm text-sand-600">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <Button type="submit" block loading={isSubmitting}>
            Send reset link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-sand-600">
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-900">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
