import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'At least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      const { needsEmailConfirmation } = await signUp(values.email, values.password, values.fullName)
      if (needsEmailConfirmation) {
        setNeedsConfirmation(true)
      } else {
        navigate('/account', { replace: true })
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create account')
    }
  }

  if (needsConfirmation) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-sand-900">Check your email</h1>
          <p className="mt-3 text-sand-600">
            We've sent a confirmation link to finish setting up your account. Once confirmed, you can
            sign in.
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
        <h1 className="font-display text-2xl font-semibold text-sand-900">Create an account</h1>
        <p className="mt-1.5 text-sm text-sand-600">Track orders, save addresses, and more.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          {formError ? <p className="text-sm text-danger">{formError}</p> : null}

          <Button type="submit" block loading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-sand-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-900">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
