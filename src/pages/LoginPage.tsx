import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { m, type Variants } from 'framer-motion'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useAuth } from '@/features/auth/AuthProvider'

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await signIn(values.email, values.password)
      const redirect = searchParams.get('redirect')
      navigate(redirect ? decodeURIComponent(redirect) : '/account', {
        replace: true,
        state: { authMessage: 'You are now logged in successfully.' },
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not sign in')
    }
  }

  const fieldVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.55 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your account and orders">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email field */}
        <m.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        </m.div>

        {/* Password field */}
        <m.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </m.div>

        {/* Error message */}
        {formError ? (
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-danger">{formError}</p>
          </m.div>
        ) : null}

        {/* Forgot password link */}
        <m.div className="text-right" custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          <Link to="/forgot-password" className="text-sm font-medium text-iris-700 hover:text-iris-900">
            Forgot password?
          </Link>
        </m.div>

        {/* Submit button */}
        <m.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <Button type="submit" block loading={isSubmitting}>
            Sign in
          </Button>
        </m.div>

        {/* Sign up link */}
        <m.div className="text-center" custom={4} variants={fieldVariants} initial="hidden" animate="visible">
          <p className="text-sm text-ink-600">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-iris-700 hover:text-iris-900">
              Create an account
            </Link>
          </p>
        </m.div>
      </form>
    </AuthLayout>
  )
}
