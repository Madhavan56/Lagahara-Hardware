import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
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
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        </motion.div>

        {/* Password field */}
        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </motion.div>

        {/* Error message */}
        {formError ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-danger">{formError}</p>
          </motion.div>
        ) : null}

        {/* Forgot password link */}
        <motion.div className="text-right" custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-700 hover:text-brand-900">
            Forgot password?
          </Link>
        </motion.div>

        {/* Submit button */}
        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <Button type="submit" block loading={isSubmitting}>
            Sign in
          </Button>
        </motion.div>

        {/* Sign up link */}
        <motion.div className="text-center" custom={4} variants={fieldVariants} initial="hidden" animate="visible">
          <p className="text-sm text-sand-600">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-900">
              Create an account
            </Link>
          </p>
        </motion.div>
      </form>
    </AuthLayout>
  )
}
